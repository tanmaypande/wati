import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../components/SuperAdminLayout/SuperAdminLayout';
import { listWorkspaces, createCompany, updateWorkspaceStatus } from '../services/superAdminApi';
import { FiPlus, FiSearch, FiBriefcase, FiCheckCircle, FiSlash, FiEye } from 'react-icons/fi';

export default function SuperAdminCompanies() {
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Create form state
  const [form, setForm] = useState({
    name: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  async function loadWorkspaces() {
    try {
      setLoading(true);
      const res = await listWorkspaces({ q: search, status: statusFilter || undefined });
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadWorkspaces();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  async function handleCreateCompany(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      await createCompany(form);
      setSuccess('New company and Admin user created successfully!');
      setShowModal(false);
      setForm({ name: '', adminName: '', adminEmail: '', adminPassword: '' });
      await loadWorkspaces();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create company');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStatusToggle(workspaceId, currentStatus) {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!window.confirm(`Are you sure you want to change company status to ${newStatus}?`)) return;

    try {
      await updateWorkspaceStatus(workspaceId, newStatus);
      setSuccess(`Workspace status changed to ${newStatus}`);
      await loadWorkspaces();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update status');
    }
  }

  return (
    <SuperAdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#f8fafc', margin: '0 0 8px 0' }}>
            Company & Tenant Workspaces
          </h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '15px' }}>
            Manage platform registered companies, suspend/activate access, and create new tenant accounts.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '12px 20px',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
          }}
        >
          <FiPlus style={{ fontSize: '18px' }} />
          Create Company
        </button>
      </div>

      {error && (
        <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.2)', marginBottom: '20px' }}>
          {success}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search company name, slug, or admin email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 44px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '12px 16px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#f8fafc',
            fontSize: '14px',
            outline: 'none',
          }}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active Only</option>
          <option value="SUSPENDED">Suspended Only</option>
        </select>
      </div>

      {/* Companies Table */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', backgroundColor: '#0f172a' }}>
                <th style={{ padding: '16px' }}>Company</th>
                <th style={{ padding: '16px' }}>Admin</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px' }}>Users / Agents</th>
                <th style={{ padding: '16px' }}>Contacts</th>
                <th style={{ padding: '16px' }}>WhatsApp Status</th>
                <th style={{ padding: '16px' }}>Created</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                    Searching platform workspaces...
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                    No companies found matching criteria.
                  </td>
                </tr>
              ) : (
                data.items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '16px', fontWeight: '600', color: '#f8fafc' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FiBriefcase style={{ color: '#0284c7' }} />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#cbd5e1' }}>
                      {item.admin ? (
                        <div>
                          <div style={{ fontWeight: '500' }}>{item.admin.name}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{item.admin.email}</div>
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: item.status === 'ACTIVE' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                        color: item.status === 'ACTIVE' ? '#34d399' : '#f87171',
                        border: `1px solid ${item.status === 'ACTIVE' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#cbd5e1' }}>
                      {item.userCount} users ({item.agentCount} agents)
                    </td>
                    <td style={{ padding: '16px', color: '#cbd5e1' }}>
                      {item.contactCount} contacts
                    </td>
                    <td style={{ padding: '16px', color: '#cbd5e1', fontSize: '13px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: item.whatsAppStatus === 'CONNECTED' ? 'rgba(52, 211, 153, 0.1)' : '#334155',
                        color: item.whatsAppStatus === 'CONNECTED' ? '#34d399' : '#94a3b8',
                      }}>
                        {item.whatsAppStatus}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#94a3b8', fontSize: '13px' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => navigate(`/super-admin/companies/${item.id}`)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#334155',
                            color: '#f8fafc',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <FiEye /> View
                        </button>

                        <button
                          onClick={() => handleStatusToggle(item.id, item.status)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: item.status === 'ACTIVE' ? 'rgba(248, 113, 113, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                            color: item.status === 'ACTIVE' ? '#f87171' : '#34d399',
                            border: `1px solid ${item.status === 'ACTIVE' ? 'rgba(248, 113, 113, 0.3)' : 'rgba(52, 211, 153, 0.3)'}`,
                            borderRadius: '6px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {item.status === 'ACTIVE' ? <FiSlash /> : <FiCheckCircle />}
                          {item.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to Create Company */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #334155',
            width: '100%',
            maxWidth: '520px',
            padding: '28px',
            color: '#f8fafc',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 16px 0' }}>
              Create New Company Workspace
            </h2>

            <form onSubmit={handleCreateCompany}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Solutions Inc"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  Company Admin Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={form.adminName}
                  onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  Company Admin Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@acme.com"
                  value={form.adminEmail}
                  onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  Temporary Admin Password * (Exactly 8 chars: 1 upper, 1 lower, 1 digit, 1 special)
                </label>
                <input
                  type="password"
                  required
                  placeholder="e.g. Temp123!"
                  value={form.adminPassword}
                  onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '10px 18px', backgroundColor: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '10px 20px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {actionLoading ? 'Creating...' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
