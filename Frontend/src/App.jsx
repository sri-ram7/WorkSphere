
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import Navbar from "./components/navbar/navbar.jsx";
import DashboardLayout from "./layouts/Dashboardlayout.jsx";
import { useAuth } from "./context/AuthContext";

const Expenses = lazy(() => import("./pages/expenses.jsx"));
const Tasks = lazy(() => import("./pages/tasks.jsx"));
const Calendar = lazy(() => import("./pages/calendar.jsx"));
const Attendance = lazy(() => import("./pages/attendance.jsx"));
const Academics = lazy(() => import("./pages/academics.jsx"));
const Login = lazy(() => import("./pages/login.jsx"));
const Hero = lazy(() => import("./pages/hero.jsx"));
const UserProfile = lazy(() => import("./pages/user.jsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.jsx"));
const AuthRequired = lazy(() => import("./pages/AuthRequired.jsx"));

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth-required" replace state={{ from: location }} />;
  }

  return children;
};

function App() {
  const { user, loading } = useAuth();

  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#888' }}>Loading Page...</div>}>
      <Routes>

      <Route path="/" element={<Navigate to="/hero" />} />

      <Route
        path="/hero"
        element={
          <>
            <Navbar />
            <Hero />
          </>
        }
      />

      <Route path="/auth-required" element={<AuthRequired />} />

      <Route path="/expenses" element={
        <ProtectedRoute>
          <DashboardLayout><Expenses /></DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/tasks" element={
        <ProtectedRoute>
          <DashboardLayout><Tasks /></DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/calendar" element={
        <ProtectedRoute>
          <DashboardLayout><Calendar /></DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/attendance" element={
        <ProtectedRoute>
          <DashboardLayout><Attendance /></DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/academics" element={
        <ProtectedRoute>
          <DashboardLayout><Academics /></DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/login" element={
        loading
          ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>
          : user
            ? <Navigate to="/hero" replace />
            : <Login />
      } />

      <Route path="/forgot-password" element={
        loading
          ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>
          : user
            ? <Navigate to="/hero" replace />
            : <ForgotPassword />
      } />

      <Route path="/reset-password/:token" element={
        loading
          ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>
          : user
            ? <Navigate to="/hero" replace />
            : <ResetPassword />
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <DashboardLayout><UserProfile /></DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/hero" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
