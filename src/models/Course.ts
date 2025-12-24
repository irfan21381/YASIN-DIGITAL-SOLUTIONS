import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  totalModules: { type: Number, default: 0 },
  // optionally teacher, tags, etc
}, { timestamps: true });

export default mongoose.model("Course", courseSchema);
