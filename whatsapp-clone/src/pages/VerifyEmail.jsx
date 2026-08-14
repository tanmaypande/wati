import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaRedo, FaCheckCircle, FaArrowRight, FaShieldAlt } from 'react-icons/fa';
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
  const [resending, setResending] = useState(false);
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
      setSuccess('Email verified successfully! Redirecting to login...');
      setTimeout(() => navigate('/login', { replace: true }), 1500);
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
    setResending(true);
    try {
      const resp = await apiResend({ email });
      setSuccess(resp?.message || 'New 6-digit verification code sent to your email.');
      setResendCooldown(60);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-card" style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
          <div className="login-card-header">
            <div className="login-card-icon"><FaShieldAlt /></div>
            <div>
              <h2>Verify Your Email</h2>
              <p>We've sent a 6-digit verification code to:</p>
              <p style={{ fontWeight: 600, color: '#098fdc', marginTop: '2px' }}>
                {email || 'your email'}
              </p>
            </div>
          </div>

          <form onSubmit={handleVerify} className="login-form">
            <label className="login-field">
              <span>Enter 6-Digit Code</span>
              <div className="input-icon-group" style={{ justifyContent: 'center' }}>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  maxLength={6}
                  style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.25rem', fontWeight: 700 }}
                  required
                />
              </div>
            </label>

            {error && <div className="login-error">{error}</div>}
            {success && (
              <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(37, 211, 102, 0.12)', color: '#059669', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(37, 211, 102, 0.25)' }}>
                <FaCheckCircle style={{ color: '#10b981' }} /> {success}
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : <>Verify Email & Continue <FaArrowRight /></>}
            </button>
          </form>

          {/* Styled Resend Box */}
          <div className="resend-box">
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                Didn't receive the code?
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : 'Check spam folder or request a new code'}
              </div>
            </div>

            <button
              type="button"
              className="resend-btn"
              onClick={handleResend}
              disabled={resendCooldown > 0 || resending}
            >
              <FaRedo className={resending ? 'spin' : ''} />
              {resending ? 'Sending...' : resendCooldown > 0 ? `${resendCooldown}s` : 'Resend Code'}
            </button>
          </div>

          <div className="login-footer" style={{ marginTop: '20px' }}>
            <span>Need to change email or log in? </span>
            <button
              type="button"
              className="login-link"
              onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', color: '#098fdc', cursor: 'pointer', padding: 0, fontWeight: 600 }}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
