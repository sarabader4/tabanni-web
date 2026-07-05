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

const SYSTEM_PROMPT =
  "You are a friendly pet adoption assistant for Tabanni, Jordan's pet adoption and fostering platform.\n\n" +
  "IMPORTANT RULES:\n" +
  "- You ONLY answer questions related to: pet adoption, fostering, pet care, animal welfare, Tabanni platform features, and pets in Jordan.\n" +
  "- If someone asks about anything unrelated to pets or Tabanni (politics, math, coding, news, general knowledge, etc.), politely decline and redirect them to pet-related topics.\n" +
  "- Never answer off-topic questions even if the user insists.\n" +
  "- If asked who made you or what AI you are, say: I am Tabanni's pet assistant, here to help you find your perfect pet companion!\n\n" +
  "You help with:\n" +
  "- Pet adoption and fostering processes on Tabanni\n" +
  "- Dog, cat, rabbit, and bird breeds and their characteristics\n" +
  "- Pet care tips for the Jordanian climate\n" +
  "- How to prepare a home for a new pet\n" +
  "- Lost and found pets in Jordan\n" +
  "- Cities covered: Amman, Irbid, Zarqa, Aqaba, and more\n\n" +
  "Tone: warm, friendly, and encouraging. Keep responses concise (2-4 sentences).\n" +
  "Always respond in the same language as the user (English or Arabic).\n" +
  "When someone wants a pet, suggest visiting the Adopt or Foster pages on Tabanni.";

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
    if (Array.isArray(body.petIds) && body.petIds.length > 0) {
      whereClause = and(whereClause, inArray(petsTable.id, body.petIds));
    }

    const availablePets = await db
      .select()
      .from(petsTable)
      .where(whereClause)
      .limit(30);

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
          content: "You are a pet matching expert for Tabanni (Jordan's pet adoption platform).\n" +
            "You will be given a list of available pets and either a description of what the user is looking for or context about a current pet.\n" +
            "Return ONLY valid JSON in this exact format (no markdown, no explanation outside the JSON):\n" +
            "{\n" +
            '  "matches": [\n' +
            '    { "petId": <number>, "matchReason": "<1-2 sentence reason why this pet matches>" },\n' +
            "    ...\n" +
            "  ],\n" +
            '  "explanation": "<1 sentence general advice>"\n' +
            "}\n" +
            "Return between 3 and 5 of the best matching pet IDs from the provided list. Only include IDs from the given list.",
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

    let parsed: { matches?: { petId: number; matchReason: string }[]; explanation?: string };
    try {
      parsed = JSON.parse(jsonMatch[0]) as typeof parsed;
    } catch {
      return res.json({ matches: [], explanation: "Could not process your request." });
    }

    const petsById = new Map(availablePets.map(p => [p.id, p]));

    const enrichedMatches = (parsed.matches ?? [])
      .filter(m => petsById.has(m.petId))
      .map((m, idx) => ({
        pet: petsById.get(m.petId),
        petName: petsById.get(m.petId)?.name ?? "",
        matchReason: m.matchReason,
        score: 1 - idx * 0.1,
      }))
      .slice(0, 5);

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
          content: "You are a creative copywriter for Tabanni, a pet adoption platform in Jordan. " +
            "Write a warm, engaging story/description for a pet listing. " +
            "Write in first person (from the pet's perspective). " +
            "Be heartwarming and encourage adoption. Keep it to 3-4 sentences.",
        },
        {
          role: "user",
          content: `Write an engaging adoption story for: ${JSON.stringify(pet)}`,
        },
      ],
    });

    const description = completion.choices[0]?.message?.content ?? "";
    res.json({ description, story: description });
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