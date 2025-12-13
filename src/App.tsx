import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Public Pages
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Layouts
import MainLayout from "./layout/MainLayout";
import StudentLayout from "./layout/StudentLayout";
import AdminLayout from "./layout/AdminLayout";
import ManagerLayout from "./layout/ManagerLayout";
import TeacherLayout from "./layout/TeacherLayout";
import EmployeeLayout from "./layout/EmployeeLayout";

// Student Pages
import StudentDashboard from "./components/student/Dashboard";
import Profile from "./components/student/Profile";
import Internships from "./components/student/Internships";
import Payments from "./pages/student/Payments";

// Admin Pages
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import PaymentRequests from "./pages/admin/PaymentRequests";

// Manager Pages
import ManagerDashboard from "./pages/ManagerDashboard";

// Teacher Pages
import TeacherDashboard from "./pages/TeacherDashboard";

// Protected Route
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* ---------------- PUBLIC ---------------- */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ---------------- STUDENT ---------------- */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["STUDENT", "PUBLIC_STUDENT"]} />
            }
          >
            <Route element={<StudentLayout />}>
              <Route index element={<Navigate to="/student/dashboard" />} />
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/profile" element={<Profile />} />
              <Route path="/student/internships" element={<Internships />} />
              <Route path="/student/payments" element={<Payments />} />
            </Route>
          </Route>

          {/* ---------------- SUPER ADMIN ---------------- */}
          <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" />} />
              <Route
                path="/admin/dashboard"
                element={<SuperAdminDashboard />}
              />
              <Route
                path="/admin/payment-requests"
                element={<PaymentRequests />}
              />
            </Route>
          </Route>

          {/* ---------------- MANAGER ---------------- */}
          <Route element={<ProtectedRoute allowedRoles={["MANAGER"]} />}>
            <Route element={<ManagerLayout />}>
              <Route
                path="/manager/dashboard"
                element={<ManagerDashboard />}
              />
            </Route>
          </Route>

          {/* ---------------- TEACHER ---------------- */}
          <Route element={<ProtectedRoute allowedRoles={["TEACHER"]} />}>
            <Route element={<TeacherLayout />}>
              <Route
                path="/teacher/dashboard"
                element={<TeacherDashboard />}
              />
            </Route>
          </Route>

          {/* ---------------- EMPLOYEE ---------------- */}
          <Route element={<ProtectedRoute allowedRoles={["EMPLOYEE"]} />}>
            <Route element={<EmployeeLayout />}>
              <Route
                path="/employee/dashboard"
                element={<div>Employee Dashboard</div>}
              />
            </Route>
          </Route>

          {/* ---------------- FALLBACK ---------------- */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
