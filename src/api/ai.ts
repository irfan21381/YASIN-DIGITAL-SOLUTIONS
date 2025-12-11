import { api } from "@/lib/api";

export const generalAIQuery = async (prompt: string) => {
  const response = await api.post(`/ai/query`, { prompt });
  return response.data;
};