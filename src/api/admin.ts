import { api } from "@/lib/api";

// Create a new college
export const createCollege = async (name: string) => {
  const response = await api.post(`/admin/college`, { name });
  return response.data;
};

// Assign a manager to a college
export const assignManager = async (collegeId: string, managerEmail: string) => {
  const response = await api.post(`/admin/college/${collegeId}/manager`, { managerEmail });
  return response.data;
};

// Activate or deactivate a college
export const activateDeactivateCollege = async (collegeId: string, isActive: boolean) => {
  const response = await api.patch(`/admin/college/${collegeId}/activate`, { isActive });
  return response.data;
};

// Get complete analytics dashboard
export const getGlobalAnalytics = async () => {
  const response = await api.get(`/admin/stats`);
  return response.data;
};

// Get list of all colleges
export const getAllColleges = async () => {
  const response = await api.get(`/admin/colleges`);
  return response.data;
};
