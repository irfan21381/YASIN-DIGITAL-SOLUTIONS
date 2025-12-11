const { db } = require("../../config/database");
const { contents } = require("../../db/schema/content");
const { contentEmbeddings } = require("../../db/schema/contentEmbeddings");

const { generateEmbedding, chatCompletion } = require("../../config/ai");
const { chunkText } = require("../../utils/pdfExtractor");

const { and, eq } = require("drizzle-orm");

/* ============================================================
   🔹 COSINE SIMILARITY (Node.js based, no pgvector needed)
============================================================ */
const cosineSimilarity = (A, B) => {
  if (!A || !B || A.length !== B.length) return 0;

  let dot = 0,
    normA = 0,
    normB = 0;

  for (let i = 0; i < A.length; i++) {
    dot += A[i] * B[i];
    normA += A[i] * A[i];
    normB += B[i] * B[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
};

/* ============================================================
   🔹 PROCESS & EMBED CONTENT  (JSONB vectors)
============================================================ */
const processContentForEmbedding = async (contentId) => {
  const [content] = await db
    .select()
    .from(contents)
    .where(eq(contents.id, contentId));

  if (!content) throw new Error("Content not found");

  let text = content.extractedText || content.description || content.title || "";

  if (!text?.trim()) throw new Error("No text available to embed");

  // Split into chunks
  const chunks = chunkText(text, 1000, 200);

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk.text);

    await db.insert(contentEmbeddings).values({
      contentId,
      chunk: chunk.text,
      embedding, // JSONB vector
      startIndex: chunk.startIndex,
      endIndex: chunk.endIndex,
    });
  }

  await db
    .update(contents)
    .set({
      isEmbedded: true,
      updatedAt: new Date(),
    })
    .where(eq(contents.id, contentId));

  return { success: true, chunks: chunks.length };
};

/* ============================================================
   🔹 FIND RELEVANT CHUNKS (Postgres fetch + JS similarity)
============================================================ */
const findRelevantChunks = async (
  queryEmbedding,
  collegeId,
  subjectId,
  unit,
  limit = 5
) => {
  let where = eq(contents.collegeId, collegeId);
  if (subjectId) where = and(where, eq(contents.subjectId, subjectId));
  if (unit) where = and(where, eq(contents.unit, unit));

  // Fetch all embeddings matching college/subject/unit
  const rows = await db
    .select({
      contentId: contents.id,
      title: contents.title,
      unit: contents.unit,
      chunk: contentEmbeddings.chunk,
      emb: contentEmbeddings.embedding, // JSONB array
    })
    .from(contentEmbeddings)
    .innerJoin(contents, eq(contentEmbeddings.contentId, contents.id))
    .where(where);

  const scored = rows.map((r) => ({
    contentId: r.contentId,
    title: r.title,
    unit: r.unit,
    chunk: r.chunk,
    similarity: cosineSimilarity(queryEmbedding, r.emb),
  }));

  scored.sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, limit);
};

/* ============================================================
   🔹 ANSWER DOUBT (RAG pipeline)
============================================================ */
const answerDoubt = async (question, studentId, collegeId, subjectId, unit) => {
  if (!question || question.trim().length === 0) {
    return {
      answer: "Please enter a valid question.",
      sources: [],
      confidence: 0,
    };
  }

  const queryEmbedding = await generateEmbedding(question);

  const chunks = await findRelevantChunks(
    queryEmbedding,
    collegeId,
    subjectId,
    unit,
    5
  );

  // Not enough relevance
  if (!chunks.length || chunks[0].similarity < 0.5) {
    return {
      answer: "Teacher has not uploaded this topic yet.",
      sources: [],
      confidence: chunks[0]?.similarity || 0,
    };
  }

  const context = chunks
    .map((c, i) => `[${i + 1}] ${c.chunk}`)
    .join("\n\n");

  const messages = [
    {
      role: "system",
      content:
        "You are an AI Teaching Assistant. Answer ONLY using the provided context. If the answer is not in the context, reply: 'Teacher has not uploaded this topic yet.'",
    },
    {
      role: "user",
      content: `Context:\n${context}\n\nQuestion: ${question}`,
    },
  ];

  const answer = await chatCompletion(messages, {
    temperature: 0.6,
    maxTokens: 600,
  });

  return {
    answer,
    confidence: chunks[0].similarity,
    sources: chunks.map((c) => ({
      contentId: c.contentId,
      title: c.title,
      unit: c.unit,
      similarity: c.similarity,
    })),
  };
};

/* ============================================================
   🔹 EXPORT
============================================================ */
module.exports = {
  processContentForEmbedding,
  answerDoubt,
  findRelevantChunks,
};
