import { Request, Response, NextFunction } from "express";
import InternshipApplication from "../models/InternshipApplication";
import { addActivity } from "./studentActivityController";

export const applyInternship = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.id;
    const payload = {
      studentId,
      name: req.body.name,
      nationality: req.body.nationality,
      email: req.body.email,
      whatsapp: req.body.whatsapp,
      domain: req.body.domain,
      college: req.body.college,
      city: req.body.city,
      passingYear: req.body.passingYear,
    };

    const app = await InternshipApplication.create(payload);

    // Log activity
    await addActivity(studentId, "APPLIED_INTERNSHIP", `Applied for ${payload.domain} internship`, { applicationId: app._id });

    res.status(201).json({ success: true, data: app });
  } catch (err) {
    next(err);
  }
};

export const getMyApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.id;
    const apps = await InternshipApplication.find({ studentId }).sort({ createdAt: -1 });
    res.json({ applications: apps });
  } catch (err) {
    next(err);
  }
};

export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction) => {
  // admin/manager endpoint to change status
  try {
    const { id } = req.params;
    const { status } = req.body;
    const app = await InternshipApplication.findByIdAndUpdate(id, { status }, { new: true });
    if (!app) return res.status(404).json({ message: "Not found" });
    // log activity for student
    await addActivity(app.studentId.toString(), "APPLICATION_STATUS_CHANGED", `Your application status changed to ${status}`);
    res.json({ data: app });
  } catch (err) {
    next(err);
  }
};
