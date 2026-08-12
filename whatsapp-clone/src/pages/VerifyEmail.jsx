import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail as apiVerifyEmail, resendVerification as apiResend } from '../services/authApi';
import '../styles/Login.css';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = (location.state && location.state.email) || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email) return setError('Email is required');
    if (!/^[0-9]{6}$/.test(otp)) return setError('Please enter the 6-digit verification code.');
    setLoading(true);
    try {
      await apiVerifyEmail({ email, otp });
      setSuccess('Email verified. You can now log in.');
      // redirect to login after short delay
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setSuccess(null);
    if (!email) return setError('Email is required');
    try {
      const resp = await apiResend({ email });
      setSuccess(resp?.message || 'Verification code resent');
      setResendCooldown(60);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to resend code');
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-card-icon">W</div>
            <div>
              <h2>Verify your email</h2>
              <p>We've sent a 6-digit verification code to:</p>
              <p style={{ fontWeight: 600 }}>{email ? (email[0] + '***' + email.split('@')[1]) : '—'}</p>
            </div>
          </div>

          <form onSubmit={handleVerify} className="login-form">
            <label className="login-field">
              <span>Verification Code</span>
              <div className="input-icon-group">
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0,6))} placeholder="_ _ _ _ _ _" required />
              </div>
            </label>

            {error && <div className="login-error">{error}</div>}
            {success && <div className="login-success">{success}</div>}

            <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Verifying...' : 'Verify Email'}</button>
          </form>

          <div style={{ marginTop: 12 }}>
            Didn't receive the code?
            {resendCooldown > 0 ? (
              <div style={{ marginTop: 6 }}>Resend available in {resendCooldown}s</div>
            ) : (
              <button className="login-link" onClick={handleResend}>Resend Code</button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
