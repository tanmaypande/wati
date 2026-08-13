import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { FiSlash, FiLogOut } from 'react-icons/fi';

export default function SuspendedWorkspace() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '16px',
        padding: '40px 32px',
        textAlign: 'center',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(248, 113, 113, 0.15)',
          color: '#f87171',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          marginBottom: '20px',
          border: '1px solid rgba(248, 113, 113, 0.3)',
        }}>
          <FiSlash />
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 12px 0', color: '#f8fafc' }}>
          Workspace Suspended
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
          Your company workspace has been temporarily suspended by the platform administrator. Access to chats, contacts, and features is currently restricted.
        </p>

        <div style={{
          backgroundColor: '#0f172a',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #334155',
          fontSize: '13px',
          color: '#cbd5e1',
          marginBottom: '28px',
          textAlign: 'left',
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px', color: '#f8fafc' }}>Account Details:</div>
          <div>User: {user?.name} ({user?.email})</div>
          <div>Company Workspace: {user?.workspaceName || 'Company'}</div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px 20px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  );
}
