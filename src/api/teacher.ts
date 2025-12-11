import { api } from "@/lib/api";

export const uploadMaterial = async (title: string, description: string, subjectId: string, file: File) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('subjectId', subjectId);
  formData.append('materialFile', file);

  const response = await api.post(`/teacher/material/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const generateQuiz = async (materialId: string | undefined, subjectId: string, title: string, description: string, numQuestions: number, generalTopic?: string) => {
  const payload: any = { subjectId, title, description, numQuestions };
  if (materialId) {
    payload.materialId = materialId;
  }
  if (generalTopic) {
    payload.generalTopic = generalTopic;
  }
  const response = await api.post(`/teacher/quiz/generate`, payload);
  return response.data;
};

export const getTeacherSubjects = async () => {
  const response = await api.get(`/teacher/subjects`);
  return response.data;
};

export const getTeacherMaterials = async () => {
  const response = await api.get(`/teacher/materials`);
  return response.data;
};

export const getTeacherAnalytics = async () => {
  const response = await api.get(`/teacher/analytics`);
  return response.data;
};

export const getTeacherQuizzes = async () => {
  const response = await api.get(`/teacher/quizzes`);
  return response.data;
};