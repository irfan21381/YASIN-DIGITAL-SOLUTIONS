// src/pages/student/Payments.tsx
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { getMyPaymentRequests, getPaymentHistory, createPaymentRequestOrder, verifyPaymentRequestPayment } from "@/api/paymentRequest";

interface PaymentRequest {
  _id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  type: string;
  status: "PENDING" | "PAID" | "CANCELLED";
  dueDate?: string;
  createdAt: string;
}

export default function Payments() {
  const [pendingPayments, setPendingPayments] = useState<PaymentRequest[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const [pendingRes, historyRes] = await Promise.all([
        getMyPaymentRequests("PENDING"),
        getPaymentHistory(),
      ]);
      setPendingPayments(pendingRes.data || []);
      setPaymentHistory(historyRes.data || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (requestId: string, amount: number, title: string) => {
    try {
      setProcessingPayment(requestId);
      
      // Create Razorpay order
      const { data } = await createPaymentRequestOrder(requestId);

      // Load Razorpay script if not already loaded
      if (!(window as any).Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => openRazorpayCheckout(data, requestId, amount, title);
        document.body.appendChild(script);
      } else {
        openRazorpayCheckout(data, requestId, amount, title);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create payment order");
      setProcessingPayment(null);
    }
  };

  const openRazorpayCheckout = (orderData: any, requestId: string, amount: number, title: string) => {
    const options = {
      key: orderData.key || import.meta.env.VITE_RAZORPAY_KEY,
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: "YDS EduAI",
      description: title,
      order_id: orderData.orderId,
      handler: async (response: any) => {
        try {
          await verifyPaymentRequestPayment(
            requestId,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
          toast.success("Payment successful!");
          setProcessingPayment(null);
          loadPayments(); // Reload payments
        } catch (error: any) {
          toast.error(error?.response?.data?.message || "Payment verification failed");
          setProcessingPayment(null);
        }
      },
      prefill: {
        email: JSON.parse(localStorage.getItem("user") || "{}").email || "",
      },
      theme: {
        color: "#3B82F6",
      },
      modal: {
        ondismiss: () => {
          setProcessingPayment(null);
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payments</h1>

      {/* Pending Payments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Payments Required
        </h2>
        {pendingPayments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No pending payments</p>
        ) : (
          <div className="space-y-4">
            {pendingPayments.map((payment) => (
              <div
                key={payment._id}
                className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg"
              >
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{payment.title}</h3>
                  {payment.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{payment.description}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Type: {payment.type.replace(/_/g, " ")}
                  </p>
                  {payment.dueDate && (
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      Due: {new Date(payment.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{payment.amount}
                  </p>
                  <button
                    onClick={() => handlePayment(payment._id, payment.amount, payment.title)}
                    disabled={processingPayment === payment._id}
                    className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingPayment === payment._id ? "Processing..." : "Pay Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Payment History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Payment History
        </h2>
        {paymentHistory.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No payment history</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left p-2 text-gray-700 dark:text-gray-300">Date</th>
                  <th className="text-left p-2 text-gray-700 dark:text-gray-300">Title</th>
                  <th className="text-left p-2 text-gray-700 dark:text-gray-300">Type</th>
                  <th className="text-right p-2 text-gray-700 dark:text-gray-300">Amount</th>
                  <th className="text-left p-2 text-gray-700 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr key={payment._id} className="border-b dark:border-gray-700">
                    <td className="p-2 text-gray-600 dark:text-gray-400">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2 text-gray-900 dark:text-white">{payment.title}</td>
                    <td className="p-2 text-gray-600 dark:text-gray-400">
                      {payment.type.replace(/_/g, " ")}
                    </td>
                    <td className="p-2 text-right font-medium text-gray-900 dark:text-white">
                      ₹{payment.amount}
                    </td>
                    <td className="p-2">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

