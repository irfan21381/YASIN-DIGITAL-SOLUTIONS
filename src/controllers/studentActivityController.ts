import { Request, Response, NextFunction } from "express";
import StudentActivity from "../models/StudentActivity";

export const getRecentActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user?.id;
    const activities = await StudentActivity.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    res.json({ activities });
  } catch (err) {
    next(err);
  }
};

export const addActivity = async (studentId: string, type: string, message: string, meta?: any) => {
  // helper used by controllers to log events
  try {
    await StudentActivity.create({ studentId, type, message, meta });
  } catch (err) {
    console.error("Failed to record activity", err);
  }
};
