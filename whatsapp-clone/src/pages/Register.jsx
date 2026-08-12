import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaComments, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/useAuth';
import '../styles/Login.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (raw) => {
    if (!raw) return false;
    const s = raw.trim().toLowerCase();
    const re = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return re.test(s);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await register({ name, email: normalizedEmail, password });
      // Navigate to verify-email page where user can enter the OTP
      navigate('/verify-email', { state: { email: normalizedEmail } });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Registration failed');
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
          <h1>Create your account</h1>
          <p>Manage conversations, track replies, and keep every customer interaction moving smoothly.</p>

          <ul className="login-highlights">
            <li><FaComments /> Live conversations</li>
            <li><FaLock /> Secure registration</li>
            <li><FaArrowRight /> Fast dashboard access</li>
          </ul>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <div className="login-card-icon">W</div>
            <div>
              <h2>Create Account</h2>
              <p>Set up your workspace account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label className="login-field">
              <span>Name</span>
              <div className="input-icon-group">
                <FaUser />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
              </div>
            </label>

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
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter a password" required />
              </div>
            </label>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Creating account...' : <>Create Account <FaArrowRight /></>}
            </button>
          </form>

          <div className="login-footer">By creating an account you agree to the terms of service</div>
        </div>
      </div>
    </div>
  );
}
