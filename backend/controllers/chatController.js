const { z } = require("zod");
const OpenAI = require("openai");
const Chat = require("../models/Chat");

const createMessageSchema = z.object({
  content: z.string().trim().min(1).max(20_000),
});

const renameSchema = z.object({
  title: z.string().trim().min(1).max(120),
});

function buildTitleFromFirstMessage(text) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "New chat";
  return clean.length > 60 ? `${clean.slice(0, 60)}…` : clean;
}

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function listChats(req, res) {
  const chats = await Chat.find({ userId: req.user._id })
    .select("_id title createdAt updatedAt")
    .sort({ updatedAt: -1 })
    .limit(100);
  return res.json({ chats });
}

async function getChat(req, res) {
  const chat = await Chat.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!chat) return res.status(404).json({ message: "Chat not found" });
  return res.json({ chat });
}

async function createChat(req, res) {
  const chat = await Chat.create({ userId: req.user._id, title: "New chat" });
  return res.status(201).json({ chat });
}

async function renameChat(req, res) {
  const parsed = renameSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

  const chat = await Chat.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: { title: parsed.data.title } },
    { new: true }
  ).select("_id title createdAt updatedAt");

  if (!chat) return res.status(404).json({ message: "Chat not found" });
  return res.json({ chat });
}

async function deleteChat(req, res) {
  const chat = await Chat.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!chat) return res.status(404).json({ message: "Chat not found" });
  return res.json({ ok: true });
}

async function streamMessage(req, res) {
  const parsed = createMessageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

  const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
  if (!chat) return res.status(404).json({ message: "Chat not found" });

  const userText = parsed.data.content;
  const isFirstUserMessage = chat.messages.length === 0 && chat.title === "New chat";

  chat.messages.push({ role: "user", content: userText });
  if (isFirstUserMessage) chat.title = buildTitleFromFirstMessage(userText);
  await chat.save();

  const controller = new AbortController();
  req.on("close", () => controller.abort());

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const openai = getOpenAIClient();

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const history = chat.messages
    .slice(-24)
    .map((m) => ({ role: m.role, content: m.content }));

  let full = "";

  try {
    const stream = await openai.chat.completions.create(
      {
        model,
        stream: true,
        temperature: 0.6,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful, concise assistant. Use Markdown for formatting. For code, include fenced code blocks with language when possible.",
          },
          ...history,
        ],
      },
      { signal: controller.signal }
    );

    for await (const part of stream) {
      const delta = part?.choices?.[0]?.delta?.content;
      if (!delta) continue;
      full += delta;
      res.write(delta);
    }

    res.end();

    chat.messages.push({ role: "assistant", content: full || "(no output)" });
    await chat.save();
  } catch (err) {
    if (controller.signal.aborted) {
      try {
        res.end();
      } catch {
        // ignore
      }
      return;
    }

    const msg =
      err?.message ||
      "OpenAI request failed. Check your API key, model, and usage limits.";

    try {
      res.write(`\n\n[Error] ${msg}`);
      res.end();
    } catch {
      // ignore
    }
  }
}

module.exports = {
  listChats,
  getChat,
  createChat,
  renameChat,
  deleteChat,
  streamMessage,
};

