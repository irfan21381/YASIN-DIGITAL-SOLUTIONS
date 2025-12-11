function chunkText(text, chunkSize = 800, overlap = 200) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);

    chunks.push({
      text: chunk,
      startIndex: start,
      endIndex: end,
    });

    start = end - overlap;
  }

  return chunks;
}

module.exports = { chunkText };
