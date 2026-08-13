import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiBriefcase, FiUsers, FiList, FiActivity, FiLogOut, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/useAuth';
import '../../styles/sidebar.css';

export default function SuperAdminSidebar({ open, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (onClose) onClose();
    await logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { to: '/super-admin', label: 'Platform Overview', icon: <FiGrid /> },
    { to: '/super-admin/companies', label: 'Companies / Tenants', icon: <FiBriefcase /> },
    { to: '/super-admin/users', label: 'Platform Users', icon: <FiUsers /> },
    { to: '/super-admin/audit-logs', label: 'Audit Logs', icon: <FiList /> },
    { to: '/super-admin/settings', label: 'System Health', icon: <FiActivity /> },
  ];

  return (
    <aside className={`sidebar super-admin-sidebar ${open ? 'open' : ''}`} style={{ backgroundColor: '#0f172a', borderRight: '1px solid #1e293b' }}>
      <div className="sidebar-logo" style={{ borderBottom: '1px solid #1e293b', padding: '20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px' }}>
            <FiShield />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
              WATI<span style={{ color: '#38bdf8', marginLeft: '2px' }}>SaaS</span>
            </h2>
            <span style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: '600' }}>
              Super Admin Portal
            </span>
          </div>
        </div>
      </div>

      <div className="sidebar-menu" style={{ padding: '16px 12px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/super-admin'}
            className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
            style={({ isActive }) => ({
              color: isActive ? '#38bdf8' : '#94a3b8',
              backgroundColor: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
              borderRadius: '8px',
              padding: '12px 16px',
              margin: '4px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
              fontWeight: isActive ? '600' : '500',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            })}
          >
            <span className="menu-icon" style={{ fontSize: '18px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-bottom" style={{ padding: '16px 12px', borderTop: '1px solid #1e293b' }}>
        <button
          type="button"
          className="sidebar-logout-btn"
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#1e293b',
            color: '#f87171',
            border: '1px solid #334155',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          <FiLogOut style={{ fontSize: '18px' }} />
          <span>Exit Platform Admin</span>
        </button>
      </div>
    </aside>
  );
}
