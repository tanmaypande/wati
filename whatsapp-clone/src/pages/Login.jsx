import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaComments, FaEnvelope, FaLock, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../context/useAuth';
import '../styles/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, logout, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (!authLoading && user) {
    return (
      <div className="login-page">
        <div className="login-shell">
          <div className="login-card" style={{ width: '100%', maxWidth: 450, padding: 32, textAlign: 'center' }}>
            <div className="login-card-icon" style={{ margin: '0 auto 16px' }}>W</div>
            <h2>Already Signed In</h2>
            <p style={{ margin: '12px 0 24px', color: '#6b7280', fontSize: '0.95rem' }}>
              You are currently signed in as <strong>{user.email || user.name || 'User'}</strong> ({user.role || 'User'}).
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                type="button"
                className="login-btn"
                onClick={() => navigate('/dashboard', { replace: true })}
              >
                Go to Dashboard <FaArrowRight />
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                style={{ width: '100%', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
                onClick={async () => {
                  await logout();
                }}
              >
                Sign Out & Switch Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res?.user?.role === 'SUPER_ADMIN') {
        navigate('/super-admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Login failed';
      if (msg.includes('suspended') || err?.response?.data?.code === 'WORKSPACE_SUSPENDED') {
        navigate('/workspace-suspended', { replace: true });
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-hero">
          <div className="login-glow" />
          <div className="login-badge">Secure Workspace</div>
          <h1>Welcome back to your WhatsApp command center</h1>
          <p>Manage conversations, track replies, and keep every customer interaction moving smoothly.</p>

          <ul className="login-highlights">
            <li><FaComments /> Live conversations</li>
            <li><FaShieldAlt /> Secure sign-in</li>
            <li><FaArrowRight /> Fast dashboard access</li>
          </ul>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <img src="/logo.png" alt="WATI Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
            <div>
              <h2>Sign in</h2>
              <p>Access your dashboard and chat workspace</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label className="login-field">
              <span>Email</span>
              <div className="input-icon-group">
                <FaEnvelope />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
            </label>

            <label className="login-field">
              <span>Password</span>
              <div className="input-icon-group">
                <FaLock />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
              </div>
            </label>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in...' : <>Sign in <FaArrowRight /></>}
            </button>
          </form>

          <div className="login-footer">Need help? Contact your administrator</div>

          <div className="login-footer" style={{ marginTop: 12 }}>
            <span>Don't have an account? </span>
            <button type="button" className="login-link" onClick={() => navigate('/register')} style={{ background: 'none', border: 'none', color: 'var(--accent, #2b8cff)', cursor: 'pointer', padding: 0 }}>
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
