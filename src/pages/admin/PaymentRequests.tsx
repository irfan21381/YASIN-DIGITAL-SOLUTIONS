// src/pages/admin/PaymentRequests.tsx
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  createPaymentRequest,
  getAllPaymentRequests,
  cancelPaymentRequest,
} from "@/api/paymentRequest";
import { api as studentApi } from "@/api/student";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PaymentRequest {
  _id: string;
  studentId: {
    _id: string;
    email: string;
  };
  title: string;
  description?: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
}

interface Student {
  _id: string;
  email: string;
}

export default function PaymentRequests() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [cancelRequestId, setCancelRequestId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    studentId: "",
    title: "",
    description: "",
    amount: "",
    type: "COURSE_COMPLETION",
    relatedCourseId: "",
    relatedInternshipId: "",
    dueDate: "",
  });

  useEffect(() => {
    loadRequests();
    loadStudents();
  }, []);

  const loadRequests = async () => {
    try {
      const { data } = await getAllPaymentRequests();
      setRequests(data || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load payment requests");
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      // Get all students - you may need to create this endpoint
      const { data } = await api.get("/admin/users?role=STUDENT");
      setStudents(data?.data || []);
    } catch (error) {
      console.error("Failed to load students");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPaymentRequest({
        studentId: formData.studentId,
        title: formData.title,
        description: formData.description || undefined,
        amount: parseFloat(formData.amount),
        type: formData.type,
        relatedCourseId: formData.relatedCourseId || undefined,
        relatedInternshipId: formData.relatedInternshipId || undefined,
        dueDate: formData.dueDate || undefined,
      });
      toast.success("Payment request created successfully");
      setShowForm(false);
      setFormData({
        studentId: "",
        title: "",
        description: "",
        amount: "",
        type: "COURSE_COMPLETION",
        relatedCourseId: "",
        relatedInternshipId: "",
        dueDate: "",
      });
      loadRequests();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create payment request");
    }
  };

  const handleCancel = async (requestId: string) => {
    setCancelRequestId(requestId);
  };

  const confirmCancel = async () => {
    if (!cancelRequestId) return;
    try {
      await cancelPaymentRequest(cancelRequestId);
      toast.success("Payment request cancelled");
      loadRequests();
      setCancelRequestId(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to cancel payment request");
      setCancelRequestId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Requests</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "Create Payment Request"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Create Payment Request
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Student
              </label>
              <select
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full p-2 border dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 border dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Final Exam Fee"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-2 border dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2 border dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="COURSE_COMPLETION">Course Completion</option>
                  <option value="INTERNSHIP_COMPLETION">Internship Completion</option>
                  <option value="REGISTRATION">Registration</option>
                  <option value="WORKSHOP">Workshop</option>
                  <option value="TRAINING">Training</option>
                  <option value="PENDING_DUES">Pending Dues</option>
                  <option value="MISSING_FEE">Missing Fee</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full p-2 border dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Request
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border dark:border-gray-700 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Requests List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          All Payment Requests
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left p-2 text-gray-700 dark:text-gray-300">Student</th>
                <th className="text-left p-2 text-gray-700 dark:text-gray-300">Title</th>
                <th className="text-left p-2 text-gray-700 dark:text-gray-300">Type</th>
                <th className="text-right p-2 text-gray-700 dark:text-gray-300">Amount</th>
                <th className="text-left p-2 text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left p-2 text-gray-700 dark:text-gray-300">Date</th>
                <th className="text-left p-2 text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id} className="border-b dark:border-gray-700">
                  <td className="p-2 text-gray-600 dark:text-gray-400">
                    {typeof request.studentId === "object"
                      ? request.studentId.email
                      : request.studentId}
                  </td>
                  <td className="p-2 text-gray-900 dark:text-white">{request.title}</td>
                  <td className="p-2 text-gray-600 dark:text-gray-400">
                    {request.type.replace(/_/g, " ")}
                  </td>
                  <td className="p-2 text-right font-medium text-gray-900 dark:text-white">
                    ₹{request.amount}
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        request.status === "PAID"
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                          : request.status === "PENDING"
                          ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                          : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="p-2 text-gray-600 dark:text-gray-400">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-2">
                    {request.status === "PENDING" && (
                      <button
                        onClick={() => handleCancel(request._id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Confirmation Dialog */}
      <AlertDialog open={cancelRequestId !== null} onOpenChange={(open) => !open && setCancelRequestId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Payment Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this payment request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancelRequestId(null)}>No, Keep It</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-red-600 hover:bg-red-700">
              Yes, Cancel Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

