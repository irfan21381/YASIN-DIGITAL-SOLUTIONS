// src/pages/Register.tsx
import { Link } from "react-router-dom";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { registerStudent } from "@/api/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    department: "",
    year: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Name and email are required");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      // register payload - set isPublicStudent = true to indicate open registration
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        college: form.college || undefined,
        department: form.department || undefined,
        year: form.year || undefined,
        password: form.password,
        role: "STUDENT",
        isPublicStudent: true,
      };
      const res = await registerStudent(payload);
      toast.success(res?.message || "Registered successfully! Check your email for OTP to verify.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg p-8 rounded-2xl bg-white/90 dark:bg-[rgba(255,255,255,0.03)] border shadow-xl"
      >
        <h2 className="text-2xl font-semibold text-center mb-4">Student Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-slate-600">Full name</label>
            <input className="w-full p-3 rounded-md bg-white/80 dark:bg-gray-800 border" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-600">Email</label>
              <input className="w-full p-3 rounded-md bg-white/80 dark:bg-gray-800 border" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-slate-600">Phone</label>
              <input className="w-full p-3 rounded-md bg-white/80 dark:bg-gray-800 border" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-600">College</label>
              <input className="w-full p-3 rounded-md bg-white/80 dark:bg-gray-800 border" value={form.college} onChange={(e) => handleChange("college", e.target.value)} placeholder="(optional)" />
            </div>
            <div>
              <label className="text-sm text-slate-600">Department</label>
              <input className="w-full p-3 rounded-md bg-white/80 dark:bg-gray-800 border" value={form.department} onChange={(e) => handleChange("department", e.target.value)} placeholder="(optional)" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-600">Year / Semester</label>
              <input className="w-full p-3 rounded-md bg-white/80 dark:bg-gray-800 border" value={form.year} onChange={(e) => handleChange("year", e.target.value)} placeholder="(optional)" />
            </div>
            <div />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-600">Password</label>
              <input type="password" className="w-full p-3 rounded-md bg-white/80 dark:bg-gray-800 border" value={form.password} onChange={(e) => handleChange("password", e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-slate-600">Confirm Password</label>
              <input type="password" className="w-full p-3 rounded-md bg-white/80 dark:bg-gray-800 border" value={form.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-blue-600 text-white">
            {loading ? "Registering..." : "Register"}
          </button>

          <div className="text-sm text-center">
            Already registered? <Link to="/login" className="text-blue-600">Login</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
