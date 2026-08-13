import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../components/SuperAdminLayout/SuperAdminLayout';
import { getPlatformOverview } from '../services/superAdminApi';
import { FiBriefcase, FiCheckCircle, FiSlash, FiUsers, FiMessageSquare, FiSend, FiUserCheck } from 'react-icons/fi';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getPlatformOverview();
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load platform stats');
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  if (loading) {
    return (
      <SuperAdminLayout>
        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '60px 0' }}>Loading Platform Dashboard...</div>
      </SuperAdminLayout>
    );
  }

  if (error) {
    return (
      <SuperAdminLayout>
        <div style={{ padding: '20px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {error}
        </div>
      </SuperAdminLayout>
    );
  }

  const cards = [
    { title: 'Total Companies', count: stats.totalCompanies, icon: <FiBriefcase />, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)' },
    { title: 'Active Companies', count: stats.activeCompanies, icon: <FiCheckCircle />, color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)' },
    { title: 'Suspended Companies', count: stats.suspendedCompanies, icon: <FiSlash />, color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)' },
    { title: 'Total Users', count: stats.totalUsers, icon: <FiUsers />, color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)' },
    { title: 'Active Agents', count: stats.totalAgents, icon: <FiUserCheck />, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' },
    { title: 'Total Contacts', count: stats.totalContacts, icon: <FiSend />, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
    { title: 'Total Conversations', count: stats.totalConversations, icon: <FiMessageSquare />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
  ];

  return (
    <SuperAdminLayout>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#f8fafc', margin: '0 0 8px 0' }}>
          Platform Dashboard Overview
        </h1>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '15px' }}>
          Global metrics across all registered tenant companies and workspace operations.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        {cards.map((card, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                {card.title}
              </div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#f8fafc' }}>
                {Number(card.count).toLocaleString()}
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Companies Section */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
            Recently Registered Companies
          </h2>
          <button
            onClick={() => navigate('/super-admin/companies')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            View All Companies
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '12px 16px' }}>Company</th>
                <th style={{ padding: '12px 16px' }}>Admin</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Users</th>
                <th style={{ padding: '12px 16px' }}>Contacts</th>
                <th style={{ padding: '12px 16px' }}>Created</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentCompanies.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No companies registered yet.
                  </td>
                </tr>
              ) : (
                stats.recentCompanies.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '16px', fontWeight: '600', color: '#f8fafc' }}>{c.name}</td>
                    <td style={{ padding: '16px', color: '#cbd5e1' }}>{c.admin ? `${c.admin.name} (${c.admin.email})` : 'N/A'}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: c.status === 'ACTIVE' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                        color: c.status === 'ACTIVE' ? '#34d399' : '#f87171',
                        border: `1px solid ${c.status === 'ACTIVE' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#cbd5e1' }}>{c.userCount}</td>
                    <td style={{ padding: '16px', color: '#cbd5e1' }}>{c.contactCount}</td>
                    <td style={{ padding: '16px', color: '#94a3b8', fontSize: '13px' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button
                        onClick={() => navigate(`/super-admin/companies/${c.id}`)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#334155',
                          color: '#f8fafc',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
