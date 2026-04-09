import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './css/login.css';

function sectionTitle(pathname) {
  if (!pathname || pathname === '/') return 'this area';
  const map = {
    '/expenses': 'Expenses',
    '/tasks': 'Tasks',
    '/calendar': 'Calendar',
    '/attendance': 'Attendance',
    '/academics': 'Academics',
    '/profile': 'Profile',
  };
  return map[pathname] || pathname.replace(/^\//, '').replace(/-/g, ' ') || 'this area';
}

export default function AuthRequired() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from;
  const targetPath = from?.pathname || '/hero';

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading…
      </div>
    );
  }

  if (user) {
    return <Navigate to={targetPath} replace />;
  }

  const label = sectionTitle(from?.pathname);

  return (
    <div className="signup-container">
      <div className="signup-card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <div className="form-section" style={{ padding: '2rem' }}>
          <Link to="/hero" className="back-link">
            <i className="fas fa-arrow-left" /> Back to home
          </Link>

          <h2 style={{ marginTop: '1.25rem', marginBottom: '0.75rem' }}>Sign in required</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            You need to sign in to open <strong style={{ color: '#fff' }}>{label}</strong>. The home page stays available without an account.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <button
              type="button"
              className="create-btn"
              style={{ margin: 0 }}
              onClick={() =>
                navigate('/login', {
                  state: { from },
                  replace: false,
                })
              }
            >
              Continue to sign in
            </button>
            <Link to="/hero" style={{ color: '#6c63ff', fontWeight: 600 }}>
              Go to home instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
