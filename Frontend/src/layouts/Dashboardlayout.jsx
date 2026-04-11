import React, { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/navbar/navbar.jsx";
import { useAuth } from "../context/AuthContext";
import "./Dashboardlayout.css";

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isHome = location.pathname === "/hero" || location.pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || user?.email?.split("@")[0] || "User";
  const avatarLetter = (firstName || lastName).charAt(0).toUpperCase();

  return (
    <div className={`dashboard-container ${isHome ? "home-layout" : ""}`}>
      {!isHome && (
        <>
          <button
            className={`dashboard-hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="16" y1="2" x2="2" y2="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                <line x1="0" y1="1" x2="18" y2="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="0" y1="7" x2="18" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="0" y1="13" x2="18" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </button>

          <div className={`dashboard-mobile-menu ${menuOpen ? "open" : ""}`}>
            <div className="dashboard-mobile-header">
              <h2 className="dashboard-mobile-logo">WorkSphere</h2>
            </div>
            <div className="dashboard-mobile-nav">
              <Link to="/hero" onClick={() => setMenuOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Home
              </Link>
              <Link to="/expenses" onClick={() => setMenuOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Expenses
              </Link>
              <Link to="/tasks" onClick={() => setMenuOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
                Tasks
              </Link>
              <Link to="/calendar" onClick={() => setMenuOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Calendar
              </Link>
              <Link to="/attendance" onClick={() => setMenuOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Attendance
              </Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M6 20v-2a6 6 0 0112 0v2"/>
                </svg>
                Profile
              </Link>
            </div>
            <div className="dashboard-mobile-footer">
              {user ? (
                <div
                  className="user-pill"
                  onClick={() => { navigate("/profile"); setMenuOpen(false); }}
                  style={{ cursor: "pointer" }}
                >
                  <div className="user-avatar">{avatarLetter}</div>
                  <span className="user-lastname">{lastName}</span>
                </div>
              ) : (
                <Link to="/login" className="login-btn" onClick={() => setMenuOpen(false)}>
                  Sign Up Free
                </Link>
              )}
            </div>
          </div>

          <Sidebar />
        </>
      )}
      <div className="dashboard-content">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;

