import { useEffect, useState } from 'react';
import SuperAdminLayout from '../components/SuperAdminLayout/SuperAdminLayout';
import { getAuditLogs } from '../services/superAdminApi';
import { FiList, FiClock, FiUser, FiBriefcase } from 'react-icons/fi';

export default function SuperAdminAuditLogs() {
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const res = await getAuditLogs();
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    }
    void loadLogs();
  }, []);

  return (
    <SuperAdminLayout>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#f8fafc', margin: '0 0 8px 0' }}>
          Platform Audit Logs
        </h1>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '15px' }}>
          Traceability & security log of all Super Admin platform actions, company status changes, and admin management.
        </p>
      </div>

      {error && (
        <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', backgroundColor: '#0f172a' }}>
                <th style={{ padding: '16px' }}>Timestamp</th>
                <th style={{ padding: '16px' }}>Actor</th>
                <th style={{ padding: '16px' }}>Action</th>
                <th style={{ padding: '16px' }}>Target Type</th>
                <th style={{ padding: '16px' }}>Target / Workspace</th>
                <th style={{ padding: '16px' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                    Fetching platform audit records...
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                    No audit logs logged yet.
                  </td>
                </tr>
              ) : (
                data.items.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '16px', color: '#94a3b8', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiClock /> {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#f8fafc', fontWeight: '500' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiUser style={{ color: '#38bdf8' }} />
                        <span>{log.actorUser?.name || 'System'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: log.action.includes('SUSPENDED') ? 'rgba(248, 113, 113, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                        color: log.action.includes('SUSPENDED') ? '#f87171' : '#38bdf8',
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#cbd5e1', fontSize: '13px' }}>{log.targetType}</td>
                    <td style={{ padding: '16px', color: '#cbd5e1' }}>
                      {log.workspace?.name || log.targetId || 'Global'}
                    </td>
                    <td style={{ padding: '16px', color: '#94a3b8', fontSize: '12px', fontFamily: 'monospace' }}>
                      {log.metadata ? JSON.stringify(log.metadata) : '-'}
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
