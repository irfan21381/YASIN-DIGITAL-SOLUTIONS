import express from "express";
import { getRecentActivity } from "../controllers/studentActivityController";
import { applyInternship, getMyApplications } from "../controllers/internshipController";
import { listCourses, openCourse } from "../controllers/courseController";
import { listAssignments, submitAssignment } from "../controllers/assignmentController";
import { chatWithAI } from "../controllers/aiController";
import authMiddleware from "../middleware/authMiddleware"; // your JWT auth

const router = express.Router();

router.get("/activity", authMiddleware(["STUDENT"]), getRecentActivity);
router.post("/internships/apply", authMiddleware(["STUDENT"]), applyInternship);
router.get("/internships", authMiddleware(["STUDENT"]), getMyApplications);

router.get("/courses", authMiddleware(["STUDENT"]), listCourses);
router.post("/courses/:id/open", authMiddleware(["STUDENT"]), openCourse);

router.get("/assignments", authMiddleware(["STUDENT"]), listAssignments);
router.post("/assignments/submit", authMiddleware(["STUDENT"]), submitAssignment);

router.post("/ai/chat", authMiddleware(["STUDENT"]), chatWithAI);

export default router;
