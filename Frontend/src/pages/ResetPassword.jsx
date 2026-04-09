import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import './css/login.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordRequirements = [
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { met: /[a-z]/.test(password), text: 'One lowercase letter' },
    { met: /\d/.test(password), text: 'One number' },
    { met: /[@$!%*?&]/.test(password), text: 'One special character (@$!%*?&)' },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!allRequirementsMet) {
      setError('Please meet all password requirements');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { data } = await authAPI.resetPassword(token, password, confirmPassword);
      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="signup-container">
        <div className="signup-card">
          <div className="form-section">
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>Password Reset!</h2>
              <p>Your password has been successfully reset.</p>
              <p className="redirect-note">
                Redirecting to login page...
              </p>
              <Link to="/login" className="create-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Go to Login
              </Link>
            </div>
          </div>

          <div className="visual-section">
            <div className="visual-content">
              <div className="capturing-title">
                Welcome <span>Back,</span>
              </div>
              <div className="memory-tagline">
                Access Your Account
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

          <h2>Reset Password</h2>
          <p className="subtitle">
            Create a new password for your account.
          </p>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="input-field">
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="new-password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="password-requirements">
              <p className="requirements-title">Password requirements:</p>
              {passwordRequirements.map((req, index) => (
                <div
                  key={index}
                  className={`requirement ${req.met ? 'met' : ''}`}
                >
                  <span className="check-icon">{req.met ? '✓' : '○'}</span>
                  {req.text}
                </div>
              ))}
            </div>

            {error && <p style={{ color: 'crimson', marginTop: '8px' }}>{error}</p>}

            <button
              type="submit"
              className="create-btn"
              disabled={loading || !allRequirementsMet}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>

        <div className="visual-section">
          <div className="visual-content">
            <div className="capturing-title">
              New <span>Password,</span>
            </div>
            <div className="memory-tagline">
              Secure Access
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;