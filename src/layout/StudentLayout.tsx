// src/layout/StudentLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/student/Sidebar";
import Topbar from "../components/student/Topbar";

export default function StudentLayout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-60">
        <Topbar />
        <div className="p-6 overflow-y-auto h-[calc(100vh-64px)]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
