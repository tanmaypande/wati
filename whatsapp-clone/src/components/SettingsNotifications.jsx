import React, { useState } from 'react';
import '../styles/Settings.css';

function Toggle({ label, checked, onChange }) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

export default function SettingsNotifications() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [newConv, setNewConv] = useState(true);
  const [broadcast, setBroadcast] = useState(false);
  const [template, setTemplate] = useState(false);

  return (
    <div className="card settings-card">
      <h3>Notifications</h3>
      <p className="muted">Manage notification preferences</p>

      <div className="notifications-list">
        <Toggle label="Email Notifications" checked={emailNotifs} onChange={setEmailNotifs} />
        <Toggle label="New Conversation Notifications" checked={newConv} onChange={setNewConv} />
        <Toggle label="Broadcast Notifications" checked={broadcast} onChange={setBroadcast} />
        <Toggle label="Template Notifications" checked={template} onChange={setTemplate} />
      </div>

      <p className="muted small">These preferences are stored in the UI only. Backend persistence can be added later.</p>
    </div>
  );
}
