import { useAuth } from '../../context/useAuth';
import { FiMenu, FiShield, FiUser } from 'react-icons/fi';

export default function SuperAdminTopBar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#0f172a',
      borderBottom: '1px solid #1e293b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      color: '#f8fafc',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          type="button"
          onClick={onMenuClick}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'none',
          }}
          className="mobile-menu-btn"
        >
          <FiMenu />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            padding: '4px 10px',
            borderRadius: '20px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            fontSize: '12px',
            fontWeight: '600',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <FiShield style={{ fontSize: '13px' }} />
            GLOBAL PLATFORM ENVIRONMENT
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc' }}>
            {user?.name || 'Super Admin'}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            {user?.email}
          </div>
        </div>

        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#1e293b',
          border: '2px solid #38bdf8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#38bdf8',
          fontWeight: '700',
        }}>
          <FiUser style={{ fontSize: '20px' }} />
        </div>
      </div>
    </header>
  );
}
