import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaComments, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/useAuth';
import '../styles/Login.css';

export default function Register() {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
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

  const passwordMeets = (pw) => {
    if (!pw || typeof pw !== 'string') return false;
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,100}$/;
    return re.test(pw);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!passwordMeets(password)) {
      setError('Password requirements not met. Must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.');
      return;
    }
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await register({ name, companyName, email: normalizedEmail, password });
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
          <h1>Create your company account</h1>
          <p>Register your company workspace and access complete customer communication tools.</p>

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
              <h2>Create Company Account</h2>
              <p>Set up your company workspace</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label className="login-field">
              <span>Company / Brand Name</span>
              <div className="input-icon-group">
                <FaUser />
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Tanmay Clothing" required />
              </div>
            </label>

            <label className="login-field">
              <span>Owner Name</span>
              <div className="input-icon-group">
                <FaUser />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />
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
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <small className="password-hint">Password must be at least 8 characters and include upper, lower, number and special character.</small>
            </label>

            <label className="login-field">
              <span>Confirm Password</span>
              <div className="input-icon-group">
                <FaLock />
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Confirm password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  title={showPasswordConfirm ? 'Hide password' : 'Show password'}
                  aria-label="Toggle confirm password visibility"
                >
                  {showPasswordConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
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
