import { useState } from 'react';
import SuperAdminSidebar from './SuperAdminSidebar';
import SuperAdminTopBar from './SuperAdminTopBar';

export default function SuperAdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0b0f19', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <SuperAdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <SuperAdminTopBar onMenuClick={() => setSidebarOpen(true)} />
        <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
