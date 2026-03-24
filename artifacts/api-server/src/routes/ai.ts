import { Router, type IRouter } from "express";
import type OpenAI from "openai";

let openai: InstanceType<typeof import("openai").default> | null = null;
const AI_ENABLED = !!process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
if (AI_ENABLED) {
  // Lazy import to avoid crashing when the integration is not configured
  import("@workspace/integrations-openai-ai-server").then(m => { openai = m.openai; });
}

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are a friendly pet adoption assistant for Tabbani, Jordan's premier pet adoption and fostering platform. 
You help people find, adopt, and foster pets in Jordan (cities: Amman, Irbid, Zarqa, Aqaba).
You have expertise in:
- Pet adoption and fostering processes in Jordan
- Different dog, cat, rabbit, and bird breeds and their characteristics
- Pet care tips for the Jordanian climate
- How to prepare a home for a new pet
- Understanding Tabbani's adoption/foster process

Be warm, friendly, and encouraging. Keep responses concise (2-4 sentences max unless more detail is needed).
When people describe what they want in a pet, suggest specific breeds or types and recommend visiting the Adopt or Foster pages.
Always respond in the same language as the user (English or Arabic).`;

router.post("/ai/chat", async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ error: "ai_unavailable", message: "AI service not configured" });
    }
    const { message, history = [] } = req.body as { message: string; history?: { role: string; content: string }[] };
    if (!message) {
      return res.status(400).json({ error: "validation_error", message: "message required" });
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages,
      max_completion_tokens: 512,
    });

    const reply = completion.choices[0]?.message?.content ?? "I'm sorry, I couldn't process that request.";
    res.json({ reply });
  } catch (err) {
    req.log.error({ err }, "AI chat error");
    res.status(500).json({ error: "ai_error", message: "AI service unavailable" });
  }
});

router.post("/ai/match", async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ error: "ai_unavailable", message: "AI service not configured" });
    }
    const { preferences } = req.body as { preferences: Record<string, unknown> };
    if (!preferences) {
      return res.status(400).json({ error: "validation_error", message: "preferences required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 512,
      messages: [
        {
          role: "system",
          content: `You are a pet matching expert for Tabbani (Jordan's pet adoption platform). 
Based on user preferences, recommend what type of pet and specific characteristics would be the best match.
Return ONLY a JSON object with: { petType: string, size: string, ageRange: string, characteristics: string[], explanation: string }`,
        },
        {
          role: "user",
          content: `Find me a perfect pet match: ${JSON.stringify(preferences)}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      res.json(JSON.parse(jsonMatch[0]));
    } else {
      res.json({ explanation: content });
    }
  } catch (err) {
    req.log.error({ err }, "AI match error");
    res.status(500).json({ error: "ai_error", message: "AI service unavailable" });
  }
});

router.post("/ai/describe", async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ error: "ai_unavailable", message: "AI service not configured" });
    }
    const { pet } = req.body as { pet: Record<string, unknown> };
    if (!pet) {
      return res.status(400).json({ error: "validation_error", message: "pet data required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 300,
      messages: [
        {
          role: "system",
          content: `You are a creative copywriter for Tabbani, a pet adoption platform in Jordan. 
Write a warm, engaging story/description for a pet listing. Write in first person (from the pet's perspective). Be heartwarming and encourage adoption. Keep it to 3-4 sentences.`,
        },
        {
          role: "user",
          content: `Write an engaging adoption story for: ${JSON.stringify(pet)}`,
        },
      ],
    });

    const story = completion.choices[0]?.message?.content ?? "";
    res.json({ story });
  } catch (err) {
    req.log.error({ err }, "AI describe error");
    res.status(500).json({ error: "ai_error", message: "AI service unavailable" });
  }
});

export default router;
