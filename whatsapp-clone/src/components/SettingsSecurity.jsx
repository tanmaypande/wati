import React, { useState } from 'react';
import { changePassword as apiChangePassword } from '../services/authApi';
import '../styles/Settings.css';

export default function SettingsSecurity() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  function validate() {
    if (!currentPassword) return 'Current password is required';
    if (!newPassword) return 'New password is required';
    if (newPassword.length < 8) return 'New password must be at least 8 characters';
    if (newPassword !== confirmPassword) return 'Passwords do not match';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    const err = validate();
    if (err) return setMessage({ type: 'error', text: err });
    setLoading(true);
    try {
      await apiChangePassword({ currentPassword, newPassword });
      setMessage({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (ex) {
      const text = ex?.response?.data?.message || ex?.message || 'Unable to change password';
      setMessage({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card settings-card">
      <h3>Security</h3>
      <p className="muted">Change your account password</p>

      {message && <div className={`message ${message.type}`}>{message.text}</div>}

      <form onSubmit={handleSubmit} className="security-form">
        <label>Current Password</label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />

        <label>New Password</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

        <label>Confirm New Password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

        <div className="form-actions">
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Changing...' : 'Change Password'}</button>
        </div>
      </form>
    </div>
  );
}
