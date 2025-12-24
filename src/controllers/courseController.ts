import Course from "../models/Course";
import { Request, Response, NextFunction } from "express";
import { addActivity } from "./studentActivityController";

export const listCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courses = await Course.find().lean();
    res.json({ courses });
  } catch (err) {
    next(err);
  }
};

export const openCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = req.params.id;
    // record that the student opened the course
    const studentId = req.user!.id;
    await addActivity(studentId, "COURSE_OPENED", `Opened course ${courseId}`, { courseId });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
