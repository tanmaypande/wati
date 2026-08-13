import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../components/SuperAdminLayout/SuperAdminLayout';
import { getWorkspaceDetail, updateWorkspaceStatus } from '../services/superAdminApi';
import { FiArrowLeft, FiBriefcase, FiUsers, FiSend, FiMessageSquare, FiFileText, FiSlash, FiCheckCircle, FiShield } from 'react-icons/fi';

export default function SuperAdminCompanyDetail() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadDetail() {
    try {
      setLoading(true);
      const res = await getWorkspaceDetail(workspaceId);
      setDetail(res);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load company detail');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDetail();
  }, [workspaceId]);

  async function handleToggleStatus() {
    if (!detail) return;
    const newStatus = detail.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!window.confirm(`Are you sure you want to change company status to ${newStatus}?`)) return;

    try {
      await updateWorkspaceStatus(workspaceId, newStatus);
      setSuccess(`Company status changed to ${newStatus}`);
      await loadDetail();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update status');
    }
  }

  if (loading) {
    return (
      <SuperAdminLayout>
        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '60px 0' }}>Loading company workspace profile...</div>
      </SuperAdminLayout>
    );
  }

  if (error || !detail) {
    return (
      <SuperAdminLayout>
        <div style={{ padding: '20px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {error || 'Company not found'}
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/super-admin/companies')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: '#38bdf8',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '16px',
            padding: 0,
          }}
        >
          <FiArrowLeft /> Back to Companies
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                {detail.name}
              </h1>
              <span style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: detail.status === 'ACTIVE' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                color: detail.status === 'ACTIVE' ? '#34d399' : '#f87171',
                border: `1px solid ${detail.status === 'ACTIVE' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
              }}>
                {detail.status}
              </span>
            </div>
            <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '14px' }}>
              Workspace ID: <code style={{ color: '#cbd5e1', backgroundColor: '#0f172a', padding: '2px 6px', borderRadius: '4px' }}>{detail.id}</code> | Slug: {detail.slug}
            </p>
          </div>

          <button
            onClick={handleToggleStatus}
            style={{
              padding: '10px 18px',
              backgroundColor: detail.status === 'ACTIVE' ? 'rgba(248, 113, 113, 0.15)' : 'rgba(52, 211, 153, 0.15)',
              color: detail.status === 'ACTIVE' ? '#f87171' : '#34d399',
              border: `1px solid ${detail.status === 'ACTIVE' ? 'rgba(248, 113, 113, 0.3)' : 'rgba(52, 211, 153, 0.3)'}`,
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {detail.status === 'ACTIVE' ? <FiSlash /> : <FiCheckCircle />}
            {detail.status === 'ACTIVE' ? 'Suspend Company' : 'Activate Company'}
          </button>
        </div>
      </div>

      {success && (
        <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.2)', marginBottom: '20px' }}>
          {success}
        </div>
      )}

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Company Admin</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', marginTop: '6px' }}>{detail.admin?.name || 'N/A'}</div>
          <div style={{ fontSize: '13px', color: '#38bdf8' }}>{detail.admin?.email || 'N/A'}</div>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Agents / Users</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', marginTop: '4px' }}>{detail.users?.length || 0}</div>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Total Contacts</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', marginTop: '4px' }}>{detail.contactCount}</div>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Total Conversations</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', marginTop: '4px' }}>{detail.conversationCount}</div>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>WhatsApp Config</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: detail.whatsappAccount?.status === 'CONNECTED' ? '#34d399' : '#94a3b8', marginTop: '6px' }}>
            {detail.whatsappAccount?.status || 'NOT_CONFIGURED'}
          </div>
        </div>
      </div>

      {/* Users List Table */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', marginBottom: '16px' }}>
          Workspace Users & Team Members
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Role</th>
                <th style={{ padding: '12px' }}>Active Status</th>
                <th style={{ padding: '12px' }}>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {detail.users?.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '12px', fontWeight: '600', color: '#f8fafc' }}>{u.name}</td>
                  <td style={{ padding: '12px', color: '#cbd5e1' }}>{u.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      backgroundColor: u.role === 'ADMIN' ? 'rgba(56, 189, 248, 0.15)' : '#334155',
                      color: u.role === 'ADMIN' ? '#38bdf8' : '#cbd5e1',
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ color: u.isActive ? '#34d399' : '#f87171', fontWeight: '600', fontSize: '13px' }}>
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#94a3b8', fontSize: '13px' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
