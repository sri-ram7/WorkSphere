import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, logoutContext } = useAuth();
  const loggedIn = !!user;

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || user?.email?.split("@")[0] || "User";
  const avatarLetter = (firstName || lastName).charAt(0).toUpperCase();

  return (
    <nav className="navbar">
      {}
      <div className="logo-section">
        <h2 className="logo-text">WorkSphere</h2>
      </div>

      {}
      <div className="nav-links">
        <Link to="/hero">Home</Link>
        <Link to="/expenses">Expenses</Link>
        <Link to="/tasks">Tasks</Link>
        <Link to="/calendar">Calendar</Link>
        <Link to="/attendance">Attendance</Link>
      </div>

      {}
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
    </nav>
  );
}

export default Navbar;

