const { db } = require("../../config/database");
const { embeddings } = require("../../db/schema/embeddings");
const { content } = require("../../db/schema/content");
const { eq, and } = require("drizzle-orm");

function cosineSimilarity(A, B) {
  if (!A || !B || A.length !== B.length) return 0;

  let dot = 0, normA = 0, normB = 0;

  for (let i = 0; i < A.length; i++) {
    dot += A[i] * B[i];
    normA += A[i] * A[i];
    normB += B[i] * B[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

async function findRelevantChunks(queryEmbedding, collegeId, subjectId, unit) {
  const where = [];

  if (subjectId) where.push(eq(content.subjectId, subjectId));
  if (unit) where.push(eq(content.unit, unit));
  if (collegeId) where.push(eq(content.collegeId, collegeId));

  const rows = await db
    .select({
      contentId: content.id,
      title: content.title,
      unit: content.unit,
      chunk: embeddings.chunk,
      emb: embeddings.embedding,
    })
    .from(embeddings)
    .leftJoin(content, eq(embeddings.contentId, content.id))
    .where(and(...where));

  const results = rows.map((r) => ({
    contentId: r.contentId,
    title: r.title,
    unit: r.unit,
    chunk: r.chunk,
    similarity: cosineSimilarity(queryEmbedding, r.emb),
  }));

  results.sort((a, b) => b.similarity - a.similarity);

  return results.slice(0, 5);
}

module.exports = { findRelevantChunks };
