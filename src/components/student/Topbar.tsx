// src/components/student/Topbar.tsx
import React from "react";
import { useAuth } from "@/context/AuthContext";

export default function Topbar() {
  const { logout, user } = useAuth();
  return (
    <div className="w-full border-b bg-white dark:bg-gray-900 dark:border-gray-700 px-6 py-4 flex justify-end items-center">
      <div className="mr-4 text-sm text-gray-600 dark:text-gray-300">{user?.email}</div>
      <button onClick={() => logout()} className="text-red-600 hover:text-red-700">Logout</button>
    </div>
  );
}
