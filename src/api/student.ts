import { api } from "@/lib/api";

export const getStudentMaterials = async () => {
  const response = await api.get(`/student/materials`);
  return response.data;
};

export const getMaterialDetails = async (materialId: string) => {
  const response = await api.get(`/student/material/${materialId}`);
  return response.data;
};

export const askAI = async (question: string, materialId?: string) => {
  const response = await api.post(`/student/ask`, { question, materialId });
  return response.data;
};

export const getAvailableQuizzes = async () => {
  const response = await api.get(`/student/quizzes`);
  return response.data;
};

export const getQuizById = async (quizId: string) => {
  const response = await api.get(`/student/quiz/${quizId}`);
  return response.data;
};

export const submitQuizAttempt = async (quizId: string, answers: { questionText: string; selectedAnswer: string }[]) => {
  const response = await api.post(`/student/quiz/${quizId}/attempt`, { answers });
  return response.data;
};

export const getStudentEnrolledSubjects = async () => {
  const response = await api.get(`/student/subjects/enrolled`);
  return response.data;
};