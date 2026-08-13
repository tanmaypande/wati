import React from 'react';
import { FiUser, FiLock, FiGlobe, FiBell, FiMessageSquare } from 'react-icons/fi';
import '../styles/Settings.css';

export default function SettingsSidebar({ section, onSelect }) {
  const items = [
    { id: 'profile', label: 'Profile', icon: <FiUser /> },
    { id: 'security', label: 'Security', icon: <FiLock /> },
    { id: 'workspace', label: 'Workspace', icon: <FiGlobe /> },
    { id: 'whatsapp', label: 'WhatsApp API Test', icon: <FiMessageSquare /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell /> },
  ];

  return (
    <nav className="settings-sidebar">
      <ul>
        {items.map((it) => (
          <li
            key={it.id}
            className={it.id === section ? 'ss-item active' : 'ss-item'}
            onClick={() => onSelect && onSelect(it.id)}
          >
            <span className="ss-icon">{it.icon}</span>
            <span>{it.label}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
}
