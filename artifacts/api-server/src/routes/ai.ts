import { Router, type IRouter } from "express";
import type OpenAI from "openai";
import { db, petsTable } from "@workspace/db";
import { eq, and, inArray, ne } from "drizzle-orm";

let openai: InstanceType<typeof import("openai").default> | null = null;
const AI_ENABLED = !!process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
if (AI_ENABLED) {
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

    const body = req.body as {
      messages?: { role: string; content: string }[];
      message?: string;
      history?: { role: string; content: string }[];
    };

    let chatMessages: OpenAI.Chat.ChatCompletionMessageParam[];

    if (Array.isArray(body.messages) && body.messages.length > 0) {
      chatMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...body.messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      ];
    } else if (typeof body.message === "string" && body.message.trim()) {
      const history = Array.isArray(body.history) ? body.history : [];
      chatMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user", content: body.message },
      ];
    } else {
      return res.status(400).json({ error: "validation_error", message: "messages or message required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages: chatMessages,
      max_completion_tokens: 512,
    });

    const reply = completion.choices[0]?.message?.content ?? "I'm sorry, I couldn't process that request.";
    res.json({ reply });
  } catch (err) {
    req.log.error({ err }, "AI chat error");
    res.status(500).json({ error: "ai_error", message: "AI service unavailable" });
  }
});

router.post("/ai/recommend", async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ error: "ai_unavailable", message: "AI service not configured" });
    }

    const body = req.body as {
      preferences?: string | Record<string, unknown>;
      petIds?: number[];
      excludePetId?: number;
      description?: string;
    };

    const preferenceText =
      typeof body.preferences === "string"
        ? body.preferences
        : typeof body.preferences === "object" && body.preferences !== null
        ? JSON.stringify(body.preferences)
        : body.description ?? "";

    if (!preferenceText.trim() && !body.petIds?.length) {
      return res.status(400).json({ error: "validation_error", message: "preferences or petIds required" });
    }

    let whereClause = and(eq(petsTable.status, "available"), eq(petsTable.approved, true));
    if (body.excludePetId) {
      whereClause = and(whereClause, ne(petsTable.id, body.excludePetId));
    }

    let query = db
      .select({
        id: petsTable.id,
        name: petsTable.name,
        type: petsTable.type,
        breed: petsTable.breed,
        ageMonths: petsTable.ageMonths,
        gender: petsTable.gender,
        size: petsTable.size,
        story: petsTable.story,
        imageUrls: petsTable.imageUrls,
        purpose: petsTable.purpose,
        status: petsTable.status,
        approved: petsTable.approved,
        featured: petsTable.featured,
        city: petsTable.city,
      })
      .from(petsTable)
      .where(whereClause)
      .limit(30);

    const availablePets = await query;

    if (availablePets.length === 0) {
      return res.json({ matches: [], explanation: "No pets are currently available for adoption." });
    }

    const petsJson = availablePets.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      breed: p.breed,
      ageMonths: p.ageMonths,
      gender: p.gender,
      size: p.size,
      city: p.city,
      story: (p.story ?? "").slice(0, 200),
      purpose: p.purpose,
    }));

    const userPrompt = preferenceText.trim()
      ? `Available pets:\n${JSON.stringify(petsJson, null, 2)}\n\nUser is looking for: ${preferenceText}`
      : `Available pets:\n${JSON.stringify(petsJson, null, 2)}\n\nFind the best similar companions from this list.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 600,
      messages: [
        {
          role: "system",
          content: `You are a pet matching expert for Tabbani (Jordan's pet adoption platform).
You will be given a list of available pets and either a description of what the user is looking for or context about a current pet.
Return ONLY valid JSON in this exact format (no markdown, no explanation outside the JSON):
{
  "matches": [
    { "petId": <number>, "matchReason": "<1-2 sentence reason why this pet matches>" },
    ...
  ],
  "explanation": "<1 sentence general advice>"
}
Return between 3 and 5 of the best matching pet IDs from the provided list. Only include IDs from the given list.`,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.json({ matches: [], explanation: "Could not process your request." });
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      matches?: { petId: number; matchReason: string }[];
      explanation?: string;
    };
    const petsById = new Map(availablePets.map(p => [p.id, p]));

    const enrichedMatches = (parsed.matches ?? [])
      .filter(m => petsById.has(m.petId))
      .map(m => ({
        pet: petsById.get(m.petId),
        matchReason: m.matchReason,
      }));

    res.json({ matches: enrichedMatches, explanation: parsed.explanation ?? "" });
  } catch (err) {
    req.log.error({ err }, "AI recommend error");
    res.status(500).json({ error: "ai_error", message: "AI service unavailable" });
  }
});

router.post("/ai/generate-description", async (req, res) => {
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
    req.log.error({ err }, "AI generate-description error");
    res.status(500).json({ error: "ai_error", message: "AI service unavailable" });
  }
});

router.post("/ai/match", async (req, res) => {
  return res.redirect(307, "/api/ai/recommend");
});

router.post("/ai/describe", async (req, res) => {
  return res.redirect(307, "/api/ai/generate-description");
});

export default router;
