// src/pages/ForgotPassword.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { sendForgotPasswordOtp, resetPasswordWithOtp } from "@/api/auth";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { dark } = useTheme();

  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [feedback, setFeedback] = useState<null | { type: "success" | "error"; text: string }>(null);

  const showMessage = (text: string, type: "success" | "error" = "error") => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showMessage("Please enter your email address", "error");
      return;
    }

    setSendingOtp(true);
    try {
      await sendForgotPasswordOtp(email);
      setOtpSent(true);
      showMessage("OTP sent to your email. Please check your inbox.", "success");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to send OTP. Please try again.";
      showMessage(errorMsg, "error");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || !newPassword || !confirmPassword) {
      showMessage("Please fill in all fields", "error");
      return;
    }

    if (newPassword.length < 6) {
      showMessage("Password must be at least 6 characters", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("Passwords do not match", "error");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithOtp(email, otp, newPassword);
      showMessage("Password reset successfully! Redirecting to login...", "success");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to reset password. Please try again.";
      showMessage(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        dark
          ? "bg-gradient-to-b from-gray-900 to-gray-800"
          : "bg-gray-100"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className={`w-full max-w-md rounded-2xl p-8 ${
          dark
            ? "bg-[rgba(255,255,255,0.04)] backdrop-blur-md border border-white/10"
            : "bg-white shadow-xl border border-gray-200"
        }`}
      >
        <h2
          className={`text-2xl font-semibold text-center mb-2 ${
            dark ? "text-white" : "text-slate-900"
          }`}
        >
          Forgot Password
        </h2>
        <p className={`text-sm text-center mb-6 ${dark ? "text-gray-400" : "text-slate-600"}`}>
          Enter your email to receive an OTP for password reset
        </p>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`mb-4 rounded-lg border p-3 text-sm ${
              feedback.type === "error"
                ? "bg-red-100 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
                : "bg-green-100 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
            }`}
          >
            {feedback.text}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className={`block text-sm mb-2 ${dark ? "text-gray-300" : "text-slate-600"}`}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={sendingOtp}
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingOtp ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className={`block text-sm mb-2 ${dark ? "text-gray-300" : "text-slate-600"}`}>
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-md p-3 bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className={`block text-sm mb-2 ${dark ? "text-gray-300" : "text-slate-600"}`}>
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full rounded-md p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123456"
                maxLength={6}
                required
                autoFocus
              />
            </div>

            <div>
              <label className={`block text-sm mb-2 ${dark ? "text-gray-300" : "text-slate-600"}`}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-md p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className={`block text-sm mb-2 ${dark ? "text-gray-300" : "text-slate-600"}`}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setNewPassword("");
                setConfirmPassword("");
                setFeedback(null);
              }}
              className="w-full py-2 text-sm text-blue-600 hover:underline"
            >
              Use different email
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className={`text-sm ${dark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
          >
            ← Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

