import { api } from "@/lib/api";

export const addTeacher = async (email: string, subjects: string[]) => {
  const response = await api.post(`/manager/teacher`, { email, subjects });
  return response.data;
};

export const addStudent = async (email: string, isPublic: boolean, enrolledSubjects: string[]) => {
  const response = await api.post(`/manager/student`, { email, isPublic, enrolledSubjects });
  return response.data;
};

export const uploadStudentsCSV = async (file: File) => {
  const formData = new FormData();
  formData.append('studentsCsv', file);
  const response = await api.post(`/manager/upload-csv`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const approveMaterial = async (materialId: string, status: 'APPROVED' | 'REJECTED') => {
  const response = await api.put(`/manager/approve-material/${materialId}`, { status });
  return response.data;
};

export const getCollegeAnalytics = async () => {
  const response = await api.get(`/manager/analytics`);
  return response.data;
};

export const getSubjectsForCollege = async () => {
  const response = await api.get(`/manager/subjects`);
  return response.data;
};

export const getPendingMaterialsForCollege = async () => {
  const response = await api.get(`/manager/materials/pending`);
  return response.data;
};

export const createSubject = async (name: string) => {
  const response = await api.post(`/manager/subject`, { name });
  return response.data;
};