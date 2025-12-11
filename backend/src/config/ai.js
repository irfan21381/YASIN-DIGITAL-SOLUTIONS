// ------------------------------------------------------------
// ai.js (2025 Updated)
// Supports: OpenAI Responses API + Groq Chat API
// For PostgreSQL + JSONB Embeddings (No Qdrant)
// ------------------------------------------------------------

const OpenAI = require("openai");
const Groq = require("groq-sdk");
const logger = require("./logger");

let openaiClient = null;
let groqClient = null;

/* ------------------------------------------------------------
   1️⃣ Load OpenAI Client (lazy)
------------------------------------------------------------ */
const loadOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    logger.error("OPENAI_API_KEY missing");
    throw new Error("OPENAI_API_KEY is missing");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return openaiClient;
};

/* ------------------------------------------------------------
   2️⃣ Load Groq Client (lazy)
------------------------------------------------------------ */
const loadGroq = () => {
  if (!process.env.GROQ_API_KEY) {
    logger.error("GROQ_API_KEY missing");
    throw new Error("GROQ_API_KEY missing");
  }

  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  return groqClient;
};

/* ------------------------------------------------------------
   3️⃣ Generate Embedding (OpenAI)
------------------------------------------------------------ */
const generateEmbedding = async (text) => {
  try {
    const openai = loadOpenAI();

    const result = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return result.data[0].embedding;
  } catch (err) {
    logger.error("Embedding Error:", err);
    throw new Error("Failed to generate embedding");
  }
};

/* ------------------------------------------------------------
   4️⃣ Unified AI Chat Completion
   - OpenAI Responses API
   - Fallback to Groq
------------------------------------------------------------ */
const chatCompletion = async (messages, options = {}) => {
  const provider = process.env.AI_PROVIDER || "openai";

  try {
    /* ------------------------- OPENAI ------------------------- */
    if (provider === "openai") {
      const openai = loadOpenAI();

      const response = await openai.responses.create({
        model: options.model || "gpt-4o-mini",
        input: messages,
      });

      return response.output[0].content[0].text;
    }

    /* ------------------------- GROQ ---------------------------- */
    const groq = loadGroq();

    const response = await groq.chat.completions.create({
      model: options.model || "mixtral-8x7b-32768",
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1500,
    });

    return response.choices[0].message.content;
  } catch (err) {
    logger.error("Chat Completion Error:", err);
    throw new Error("AI service unavailable");
  }
};

/* ------------------------------------------------------------
   EXPORTS
------------------------------------------------------------ */
module.exports = {
  generateEmbedding,
  chatCompletion,
};
