import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    nationality: String,
    email: String,
    whatsapp: String,
    domain: String,
    college: String,
    city: String,
    passingYear: String,
    resumeUrl: String, // optional
    status: { type: String, enum: ["Not Applied","Applied","Under Review","Selected","Rejected"], default: "Applied" },
    notes: String
  },
  { timestamps: true }
);

export default mongoose.model("InternshipApplication", internshipSchema);
