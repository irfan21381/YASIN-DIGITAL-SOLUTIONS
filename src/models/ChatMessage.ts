import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: { type: String, enum: ["user","assistant"], default: "user" },
  message: String,
  response: String, // assistant response
  tokensUsed: Number
}, { timestamps: true });

export default mongoose.model("ChatMessage", chatSchema);
