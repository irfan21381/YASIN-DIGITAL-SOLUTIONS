import { api } from "@/lib/api";

// Admin: Create Payment Request
export const createPaymentRequest = async (data: {
  studentId: string;
  title: string;
  description?: string;
  amount: number;
  type: string;
  relatedCourseId?: string;
  relatedInternshipId?: string;
  dueDate?: string;
}) => {
  const response = await api.post("/payment-requests/create", data);
  return response.data;
};

// Admin: Get All Payment Requests
export const getAllPaymentRequests = async (filters?: {
  status?: string;
  type?: string;
  studentId?: string;
}) => {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.type) params.append("type", filters.type);
  if (filters?.studentId) params.append("studentId", filters.studentId);

  const response = await api.get(`/payment-requests/all?${params.toString()}`);
  return response.data;
};

// Admin: Cancel Payment Request
export const cancelPaymentRequest = async (requestId: string) => {
  const response = await api.patch(`/payment-requests/${requestId}/cancel`);
  return response.data;
};

// Student: Get My Payment Requests
export const getMyPaymentRequests = async (status?: string) => {
  const params = status ? `?status=${status}` : "";
  const response = await api.get(`/payment-requests/my-requests${params}`);
  return response.data;
};

// Student: Get Payment History
export const getPaymentHistory = async () => {
  const response = await api.get("/payment-requests/history");
  return response.data;
};

// Student: Create Payment Order
export const createPaymentRequestOrder = async (requestId: string) => {
  const response = await api.post(`/payment-requests/${requestId}/create-order`);
  return response.data;
};

// Student: Verify Payment
export const verifyPaymentRequestPayment = async (
  requestId: string,
  orderId: string,
  paymentId: string,
  signature: string
) => {
  const response = await api.post(`/payment-requests/${requestId}/verify`, {
    orderId,
    paymentId,
    signature,
  });
  return response.data;
};

