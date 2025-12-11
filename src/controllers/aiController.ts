import { Request, Response, NextFunction } from "express";
import ChatMessage from "../models/ChatMessage";
import { addActivity } from "./studentActivityController";

// NOTE: integrate with your LLM service / LLM wrapper (llmService.ts)
import { callLLM } from "../services/llmService";

export const chatWithAI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.id;
    const { prompt } = req.body;
    // call your LLM or external service
    const assistantResponse = await callLLM(prompt, { studentId });

    // store chat
    await ChatMessage.create({ studentId, role: "user", message: prompt, response: assistantResponse.text, tokensUsed: assistantResponse.tokens });

    // log activity
    await addActivity(studentId, "AI_USED", "Used AI assistant", { prompt });

    res.json({ response: assistantResponse.text });
  } catch (err) {
    next(err);
  }
};
