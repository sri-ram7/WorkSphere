import React, { useState } from 'react';
import "./css/login.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginContext, registerContext } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = isLoginMode
        ? { email: formData.email, password: formData.password }
        : {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
          };

      isLoginMode
        ? await loginContext(payload)
        : await registerContext(payload);

      const afterAuth = location.state?.from?.pathname || "/hero";
      navigate(afterAuth, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="form-section">
          <Link to="/hero" className="back-link">
            <i className="fas fa-arrow-left"></i> Back to website
          </Link>

          <h2>{isLoginMode ? "Login" : "Create an account"}</h2>
          <div className="login-prompt">
            {isLoginMode ? "New user?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsLoginMode((prev) => !prev);
                setError("");
              }}
              style={{ background: "none", border: "none", color: "#6c63ff", cursor: "pointer", padding: 0 }}
            >
              {isLoginMode ? "Create account" : "Login"}
            </button>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            {!isLoginMode && (
              <div className="name-row">
                <div className="input-field">
                  <label htmlFor="firstName">First name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    autoComplete="given-name"
                    placeholder="Fletcher"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-field">
                  <label htmlFor="lastName">Last name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    autoComplete="family-name"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            <div className="input-field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                placeholder="eg. hello@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-field">
              <label htmlFor="password">Enter your password</label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="current-password"
                placeholder="··········"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {isLoginMode && (
              <div className="forgot-password-link">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            )}

            {error && <p style={{ color: "crimson", marginTop: "8px" }}>{error}</p>}

            <button type="submit" className="create-btn">
              {loading ? "Please wait..." : isLoginMode ? "Login" : "Create account"}
            </button>
          </form>

        </div>

        <div className="visual-section">
          <div className="visual-content">
            <div className="capturing-title">
              Capturing <span>Moments,</span>
            </div>
            <div className="memory-tagline">
              Creating Memories
            </div>
            <div className="visual-footer">
              <i className="fas fa-camera-retro"></i> focus. shoot. share.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

