// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { Dashboard, Auth } from "@/layouts";
import StudentInterface from "./pages/StudentInterface";
import { SignIn } from "./pages/auth";
import { ToastContainer } from "react-toastify";

function RequireAuth({ children }) {
  const location = useLocation();
  const token = Cookies.get("authToken");
  if (!token) {
    // redirect to login, keep the attempted location for later
    return <Navigate to="/dashboard/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<StudentInterface />} />

        {/* Public login page */}
        <Route path="/dashboard/login" element={<SignIn />} />

        {/* All other /dashboard routes require auth */}
        <Route
          path="/dashboard/*"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />

        {/* Fallback to student UI */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer position="top-left" autoClose={3000} />
    </>
  );
}

export default App;
