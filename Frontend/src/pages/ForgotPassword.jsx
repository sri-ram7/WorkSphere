import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './css/login.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { data } = await authAPI.forgotPassword(email);
      if (data.success) {
        setSuccess(true);
        setMessage(data.message);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="signup-container">
        <div className="signup-card">
          <div className="form-section">
            <Link to="/login" className="back-link">
              <i className="fas fa-arrow-left"></i> Back to Login
            </Link>

            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>Check Your Email</h2>
              <p>{message}</p>
              <p className="resend-note">
                Didn't receive the email?{' '}
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="resend-btn"
                >
                  Resend
                </button>
              </p>
            </div>
          </div>

          <div className="visual-section">
            <div className="visual-content">
              <div className="capturing-title">
                Password <span>Reset,</span>
              </div>
              <div className="memory-tagline">
                Secure Your Account
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="form-section">
          <Link to="/login" className="back-link">
            <i className="fas fa-arrow-left"></i> Back to Login
          </Link>

          <h2>Forgot Password?</h2>
          <p className="subtitle">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="input-field">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && <p style={{ color: 'crimson', marginTop: '8px' }}>{error}</p>}

            <button type="submit" className="create-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </div>

        <div className="visual-section">
          <div className="visual-content">
            <div className="capturing-title">
              Password <span>Reset,</span>
            </div>
            <div className="memory-tagline">
              Secure Your Account
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;