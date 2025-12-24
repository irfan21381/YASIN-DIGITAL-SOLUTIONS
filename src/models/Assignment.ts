import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  title: String,
  description: String,
  dueDate: Date,
  attachments: [String], // urls
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Assignment", assignmentSchema);
