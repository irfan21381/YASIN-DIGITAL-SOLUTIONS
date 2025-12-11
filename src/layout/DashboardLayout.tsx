"use client";

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useHashScroll } from '@/hooks/use-hash-scroll'; // Import the new hook

const DashboardLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  useHashScroll(); // Use the hash scroll hook here

  // If not authenticated, Navbar will handle redirection, so no sidebar/layout needed
  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 pt-16"> {/* pt-16 to account for fixed Navbar height */}
        <Sidebar />
        <main className="flex-1 p-4 md:ml-64 overflow-auto"> {/* ml-64 to account for fixed Sidebar width */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;