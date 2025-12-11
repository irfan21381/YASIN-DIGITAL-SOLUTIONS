// src/components/student/Dashboard.tsx
import React from "react";
import { motion } from "framer-motion";
import useStudentStats from "@/hooks/useStudentStats";
import { useAuth } from "@/context/AuthContext";

export default function StudentDashboard() {
  const { stats, activity, loading } = useStudentStats();
  const { user } = useAuth();

  // SAFE fallback for activity
  const safeActivity = Array.isArray(activity) ? activity : [];

  // Format internship status (object)
  const internshipText = stats.internshipStatus?.pending !== undefined
    ? `${stats.internshipStatus.pending} pending, ${stats.internshipStatus.accepted} accepted`
    : "Not Applied";

  const cards = [
    { label: "Completed Courses", value: stats.completedCourses },
    { label: "Pending Assignments", value: stats.pendingAssignments },
    { label: "Internship Status", value: internshipText },
    { label: "AI Credits", value: stats.aiCredits },
  ];

  return (
    <div className="pb-20">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8 dark:text-white"
      >
        Welcome, {user?.name || "Student"} 👋
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            className="p-6 bg-white rounded-xl shadow dark:bg-gray-900"
          >
            <h2 className="text-2xl font-bold text-blue-600">
              {loading ? "…" : c.value}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-10 bg-white rounded-xl p-6 shadow dark:bg-gray-900">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          Recent Activity
        </h3>

        {safeActivity.length === 0 ? (
          <p className="text-gray-500">No recent activity.</p>
        ) : (
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            {safeActivity.map((a: any) => (
              <li key={a._id || Math.random()} className="flex items-center gap-3">
                <span className="text-purple-600">✔</span>
                <div>
                  <div>{a.action || a.message}</div>
                  <div className="text-xs text-gray-400">
                    {a.timestamp ? new Date(a.timestamp).toLocaleString() : ""}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
