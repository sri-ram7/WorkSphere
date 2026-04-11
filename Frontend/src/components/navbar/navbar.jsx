import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const { user, logoutContext } = useAuth();
  const loggedIn = !!user;
  const [menuOpen, setMenuOpen] = useState(false);

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || user?.email?.split("@")[0] || "User";
  const avatarLetter = (firstName || lastName).charAt(0).toUpperCase();

  return (
    <>
      <nav className="navbar">
        <div className="logo-section">
          <h2 className="logo-text">WorkSphere</h2>
        </div>

        <div className="nav-links">
          <Link to="/hero">Home</Link>
          <Link to="/expenses">Expenses</Link>
          <Link to="/tasks">Tasks</Link>
          <Link to="/calendar">Calendar</Link>
          <Link to="/attendance">Attendance</Link>
        </div>

        <div className="auth-section">
          {loggedIn ? (
            <div
              className="user-pill"
              onClick={() => navigate("/profile")}
              title="View profile"
              style={{ cursor: "pointer" }}
            >
              <div className="user-avatar">{avatarLetter}</div>
              <span className="user-lastname">{lastName}</span>
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              Sign Up Free
            </Link>
          )}
        </div>

        <button
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <h2 className="mobile-logo-text">WorkSphere</h2>
          <button
            className="mobile-menu-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <div className="mobile-nav-links">
          <Link to="/hero" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/expenses" onClick={() => setMenuOpen(false)}>Expenses</Link>
          <Link to="/tasks" onClick={() => setMenuOpen(false)}>Tasks</Link>
          <Link to="/calendar" onClick={() => setMenuOpen(false)}>Calendar</Link>
          <Link to="/attendance" onClick={() => setMenuOpen(false)}>Attendance</Link>
        </div>
        <div className="mobile-auth-section">
          {loggedIn ? (
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
    </>
  );
}

export default Navbar;

