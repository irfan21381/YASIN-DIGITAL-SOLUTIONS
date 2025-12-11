// src/components/student/StudentLayout.tsx
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function StudentLayout() {
  const navigate = useNavigate();

  const logout = () => {
    // clear auth state and redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-800">
      <Sidebar />
      <div className="ml-56 flex-1 flex flex-col">
        <Topbar onLogout={logout} />
        <main className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
