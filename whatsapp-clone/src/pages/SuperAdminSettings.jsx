import { useEffect, useState } from 'react';
import SuperAdminLayout from '../components/SuperAdminLayout/SuperAdminLayout';
import { getSystemHealth } from '../services/superAdminApi';
import { FiActivity, FiServer, FiDatabase, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';

export default function SuperAdminSettings() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadHealth() {
    try {
      setLoading(true);
      const res = await getSystemHealth();
      setHealth(res);
    } catch (err) {
      console.error('Failed to load system health', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadHealth();
  }, []);

  return (
    <SuperAdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#f8fafc', margin: '0 0 8px 0' }}>
            System & Infrastructure Health
          </h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '15px' }}>
            Live status of PostgreSQL database, node process uptime, and platform microservices.
          </p>
        </div>
        <button
          onClick={loadHealth}
          style={{
            padding: '10px 16px',
            backgroundColor: '#334155',
            color: '#f8fafc',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FiRefreshCw /> Refresh Status
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '60px 0' }}>Checking system diagnostics...</div>
      ) : health ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                <FiDatabase />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>Neon PostgreSQL Database</h3>
                <span style={{ fontSize: '12px', color: '#34d399', fontWeight: '600' }}>{health.database?.status}</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #334155', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '14px' }}>
              <span>DB Latency:</span>
              <span style={{ fontWeight: '600', color: '#38bdf8' }}>{health.database?.latencyMs} ms</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                <FiServer />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>Node.js Backend Server</h3>
                <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '600' }}>ONLINE</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #334155', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '14px' }}>
              <span>Uptime:</span>
              <span style={{ fontWeight: '600', color: '#38bdf8' }}>{health.uptimeSeconds} seconds</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                <FiActivity />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>Environment Info</h3>
                <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: '600' }}>{health.env}</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #334155', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '14px' }}>
              <span>Node Version:</span>
              <span style={{ fontWeight: '600', color: '#a78bfa' }}>{health.nodeVersion}</span>
            </div>
          </div>
        </div>
      ) : null}
    </SuperAdminLayout>
  );
}
