const { db } = require("../../config/database");
const { contents } = require("../../db/schema/content");
const { contentEmbeddings } = require("../../db/schema/contentEmbeddings");

const { generateEmbedding, chatCompletion } = require("../../config/ai");
const { chunkText } = require("../../utils/pdfExtractor");
const { and, eq, sql } = require("drizzle-orm");

/* ==========================================================================
   1️⃣ PROCESS → CHUNK → EMBED → SAVE (JSONB)
=========================================================================== */
const processContentForEmbedding = async (contentId) => {
  const [content] = await db
    .select()
    .from(contents)
    .where(eq(contents.id, contentId));

  if (!content) throw new Error("Content not found");

  const text = content.extractedText || content.description || "";
  if (!text.trim()) throw new Error("No text to embed");

  const chunks = chunkText(text, 800, 150);

  for (const ch of chunks) {
    const embedding = await generateEmbedding(ch.text); // array of numbers

    await db.insert(contentEmbeddings).values({
      contentId,
      chunk: ch.text,
      embedding, // stored as JSONB array
      startIndex: ch.startIndex,
      endIndex: ch.endIndex,
    });
  }

  await db
    .update(contents)
    .set({ isEmbedded: true, updatedAt: new Date() })
    .where(eq(contents.id, contentId));

  return { success: true, chunks: chunks.length };
};

/* ==========================================================================
   2️⃣ FIND RELEVANT CHUNKS USING cosine_similarity(JSONB, JSONB)
=========================================================================== */
const findRelevantChunks = async (
  queryEmbedding,
  collegeId,
  subjectId,
  unit,
  limit = 5
) => {
  let condition = eq(contents.collegeId, collegeId);
  if (subjectId) condition = and(condition, eq(contents.subjectId, subjectId));
  if (unit) condition = and(condition, eq(contents.unit, unit));

  const rows = await db
    .select({
      contentId: contents.id,
      title: contents.title,
      unit: contents.unit,
      chunk: contentEmbeddings.chunk,

      similarity: sql`cosine_similarity(
        ${contentEmbeddings.embedding},
        ${JSON.stringify(queryEmbedding)}::jsonb
      )`,
    })
    .from(contentEmbeddings)
    .innerJoin(contents, eq(contentEmbeddings.contentId, contents.id))
    .where(condition)
    .orderBy(sql`similarity DESC`)
    .limit(limit);

  return rows;
};

/* ==========================================================================
   3️⃣ RAG — Answer Doubt
=========================================================================== */
const answerDoubt = async (question, studentId, collegeId, subjectId, unit) => {
  if (!question?.trim()) {
    return { answer: "Please enter a valid question.", sources: [] };
  }

  const queryEmbedding = await generateEmbedding(question);

  const chunks = await findRelevantChunks(
    queryEmbedding,
    collegeId,
    subjectId,
    unit,
    5
  );

  if (!chunks.length || Number(chunks[0].similarity) < 0.50) {
    return { answer: "Teacher has not uploaded this topic yet.", sources: [] };
  }

  const context = chunks
    .map((c, i) => `[${i + 1}] ${c.chunk}`)
    .join("\n\n");

  const messages = [
    {
      role: "system",
      content:
        "You are an AI Teaching Assistant. Use ONLY the provided context.",
    },
    {
      role: "user",
      content: `Context:\n${context}\n\nQuestion:\n${question}`,
    },
  ];

  const answer = await chatCompletion(messages, {
    temperature: 0.5,
    maxTokens: 600,
  });

  return {
    answer,
    confidence: Number(chunks[0].similarity),
    sources: chunks.map((c) => ({
      id: c.contentId,
      title: c.title,
      similarity: c.similarity,
      unit: c.unit,
    })),
  };
};

module.exports = {
  processContentForEmbedding,
  findRelevantChunks,
  answerDoubt,
};
