import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import SettingsSidebar from '../components/SettingsSidebar';
import ProfileSettings from '../components/SettingsProfile';
import SecuritySettings from '../components/SettingsSecurity';
import WorkspaceSettings from '../components/SettingsWorkspace';
import NotificationSettings from '../components/SettingsNotifications';
import '../styles/Settings.css';

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState('profile');

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p className="muted">Manage your workspace and account settings.</p>
      </div>

      <div className="settings-layout">
        <div className="settings-left">
          <SettingsSidebar section={section} onSelect={setSection} />
        </div>

        <div className="settings-right">
          {section === 'profile' && <ProfileSettings />}
          {section === 'security' && <SecuritySettings />}
          {section === 'workspace' && <WorkspaceSettings />}
          {section === 'notifications' && <NotificationSettings />}

          <div className="settings-logout">
            <button className="btn btn-destructive" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
