import React from 'react';
import '../styles/Settings.css';

export default function SettingsWorkspace() {
  // The backend does not have workspace settings in the current schema.
  // Display UI-only fields and a short note indicating feature not configured.
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  return (
    <div className="card settings-card">
      <h3>Workspace</h3>
      <p className="muted">Workspace configuration</p>

      <div className="workspace-form">
        <label>Workspace Name</label>
        <input value="ConvoNest" readOnly />

        <label>Workspace ID</label>
        <input value="Not configured" readOnly />

        <label>Timezone</label>
        <input value={tz} readOnly />

        <label>Language</label>
        <input value={navigator.language || 'en-US'} readOnly />

        <p className="muted small">Workspace persistence is not configured in the current backend.</p>
      </div>
    </div>
  );
}
