require("dotenv").config();
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function test() {
  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: "Is my AI working?",
    });

    const text =
      response.output_text ||
      response.output?.[0]?.content?.[0]?.text ||
      "No text returned";

    console.log("AI Response:", text);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

test();
