import { api } from "@/lib/api";

// Admin: Create Salary Payment
export const createSalaryPayment = async (data: {
  employeeId: string;
  amount: number;
  paymentType: "SALARY" | "STIPEND" | "BONUS" | "CUSTOM";
  month?: string;
  year?: number;
  description?: string;
}) => {
  const response = await api.post("/salary-payments/create", data);
  return response.data;
};

// Admin: Verify Salary Payment
export const verifySalaryPayment = async (
  salaryPaymentId: string,
  orderId: string,
  paymentId: string,
  signature: string
) => {
  const response = await api.post(`/salary-payments/${salaryPaymentId}/verify`, {
    orderId,
    paymentId,
    signature,
  });
  return response.data;
};

// Admin: Get All Salary Payments
export const getAllSalaryPayments = async (filters?: {
  employeeId?: string;
  status?: string;
  paymentType?: string;
}) => {
  const params = new URLSearchParams();
  if (filters?.employeeId) params.append("employeeId", filters.employeeId);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.paymentType) params.append("paymentType", filters.paymentType);

  const response = await api.get(`/salary-payments/all?${params.toString()}`);
  return response.data;
};

// Employee: Get My Salary Payments
export const getMySalaryPayments = async () => {
  const response = await api.get("/salary-payments/my-payments");
  return response.data;
};

