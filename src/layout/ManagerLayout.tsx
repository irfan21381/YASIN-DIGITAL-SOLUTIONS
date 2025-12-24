// src/layout/ManagerLayout.tsx
import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ManagerLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg fixed h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-8">Manager</h1>
          <nav className="space-y-2">
            <Link
              to="/manager/dashboard"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Dashboard
            </Link>
            <Link
              to="/manager/teachers"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Teachers
            </Link>
            <Link
              to="/manager/students"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Students
            </Link>
            <Link
              to="/manager/materials"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Approve Materials
            </Link>
          </nav>
        </div>
      </aside>
      <div className="flex flex-col flex-1 ml-64">
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manager Dashboard</h2>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

