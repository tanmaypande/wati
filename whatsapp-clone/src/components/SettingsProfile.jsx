import React, { useEffect, useState } from 'react';
import { getProfile as apiGetProfile } from '../services/authApi';
import '../styles/Settings.css';

export default function SettingsProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await apiGetProfile();
        if (!mounted) return;
        setProfile(data);
        setName(data.name || '');
      } catch (err) {
        setMessage({ type: 'error', text: err?.response?.data?.message || 'Unable to load profile' });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  // Backend does not currently support profile updates in this project.
  // Keep UI editable but show notice and disable actual save to avoid creating unsupported behavior.
  async function handleSave(e) {
    e.preventDefault();
    setMessage({ type: 'info', text: 'Profile updates are not configured on the backend.' });
  }

  if (loading) return <div className="card">Loading profile...</div>;

  if (!profile) return <div className="card">No profile available.</div>;

  const initials = (profile.name || profile.email || 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="card settings-card">
      <h3>Profile</h3>
      <p className="muted">Manage your account profile</p>

      {message && <div className={`message ${message.type}`}>{message.text}</div>}

      <div className="profile-grid">
        <div className="avatar-col">
          <div className="avatar-circle">{initials}</div>
        </div>

        <div className="profile-form">
          <form onSubmit={handleSave}>
            <label>Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />

            <label>Email</label>
            <input value={profile.email} readOnly />

            <label>Role</label>
            <input value={profile.role} readOnly />

            <label>Member Since</label>
            <input value={new Date(profile.createdAt).toLocaleString()} readOnly />

            <div className="form-actions">
              <button className="btn" type="submit" disabled={saving}>Save Changes</button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setName(profile.name || '');
                  setMessage(null);
                }}
              >
                Reset
              </button>
            </div>

            <p className="muted small">Note: Name/email updates are not persisted because this project does not expose a profile update endpoint.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
