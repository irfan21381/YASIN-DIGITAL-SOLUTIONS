import Assignment from "../models/Assignment";
import { Request, Response, NextFunction } from "express";
import { addActivity } from "./studentActivityController";

export const listAssignments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    res.json({ assignments });
  } catch (err) {
    next(err);
  }
};

export const submitAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Simple example: store submission in StudentActivity or a separate model
    const studentId = req.user!.id;
    const { assignmentId, submissionUrl, message } = req.body;

    await addActivity(studentId, "ASSIGNMENT_SUBMITTED", `Submitted assignment ${assignmentId}`, { assignmentId, submissionUrl });

    res.json({ success: true, message: "Assignment submitted" });
  } catch (err) {
    next(err);
  }
};
