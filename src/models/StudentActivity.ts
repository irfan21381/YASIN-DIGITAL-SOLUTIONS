import mongoose from "mongoose";

const studentActivitySchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true }, // COURSE_OPENED | APPLIED_INTERNSHIP | ASSIGNMENT_SUBMITTED | PROFILE_UPDATED | AI_USED
    message: { type: String, required: true },
    meta: { type: mongoose.Schema.Types.Mixed }, // optional extra data
  },
  { timestamps: true }
);

export default mongoose.model("StudentActivity", studentActivitySchema);
