const pdf = require("pdf-parse");

/* ============================================================
   📌 Extract Text From PDF Buffer
   - Cleans text
   - Removes multiple spaces
   - Handles large PDFs
============================================================== */
const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdf(buffer);

    let text = data.text || "";

    // Cleanup text
    text = text
      .replace(/\r/g, "")
      .replace(/[^\S\r\n]+/g, " ")       // collapse spaces
      .replace(/\n\s*\n/g, "\n")         // remove empty lines
      .trim();

    return text;
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Failed to extract text from PDF");
  }
};

/* ============================================================
   📌 Smart Chunker for Embeddings
   - Splits by sentences
   - Prevents duplicate chunks
   - Maintains context overlap
============================================================== */
const chunkText = (text, chunkSize = 1000, overlap = 200) => {
  if (!text || typeof text !== "string") return [];

  const chunks = [];
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text]; // split by sentences

  let currentChunk = "";

  for (let sentence of sentences) {
    sentence = sentence.trim();
    if (!sentence) continue;

    // If adding sentence exceeds chunkSize → push chunk
    if ((currentChunk + " " + sentence).length > chunkSize) {
      const cleanChunk = currentChunk.trim();
      if (cleanChunk.length > 0) {
        chunks.push(cleanChunk);
      }

      // Start new chunk with overlap from end of previous
      const overlapText = cleanChunk.slice(-overlap);
      currentChunk = overlapText + " " + sentence;
    } else {
      currentChunk += " " + sentence;
    }
  }

  // Push last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  // Convert to structured format (startIndex not exact but useful)
  return chunks.map((ch, i) => ({
    text: ch,
    startIndex: i * chunkSize,
    endIndex: i * chunkSize + ch.length,
  }));
};

module.exports = {
  extractTextFromPDF,
  chunkText,
};
