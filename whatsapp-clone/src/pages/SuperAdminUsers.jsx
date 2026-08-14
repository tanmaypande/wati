import { useEffect, useState } from 'react';
import SuperAdminLayout from '../components/SuperAdminLayout/SuperAdminLayout';
import { listPlatformUsers, toggleUserActive, createPlatformUser, listWorkspaces } from '../services/superAdminApi';
import { FiSearch, FiUsers, FiShield, FiUserCheck, FiUserX, FiPlus } from 'react-icons/fi';

export default function SuperAdminUsers() {
  const [data, setData] = useState({ items: [], total: 0 });
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',
    workspaceId: '',
  });

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await listPlatformUsers({ q: search, role: roleFilter || undefined });
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load platform users');
    } finally {
      setLoading(false);
    }
  }

  async function loadWorkspacesList() {
    try {
      const res = await listWorkspaces({ limit: 100 });
      setWorkspaces(res.items || []);
      if (res.items && res.items.length > 0) {
        setForm((prev) => ({ ...prev, workspaceId: res.items[0].id }));
      }
    } catch (err) {
      console.warn('Failed to load workspaces list for user modal:', err);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter]);

  useEffect(() => {
    void loadWorkspacesList();
  }, []);

  async function handleToggleUserActive(user) {
    if (user.role === 'SUPER_ADMIN') {
      alert('Super Admin accounts cannot be deactivated from this view.');
      return;
    }
    const newActiveState = !user.isActive;
    if (!window.confirm(`Are you sure you want to ${newActiveState ? 'activate' : 'deactivate'} user ${user.name}?`)) return;

    try {
      await toggleUserActive(user.id, newActiveState);
      setSuccess(`User ${user.name} ${newActiveState ? 'activated' : 'deactivated'} successfully.`);
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update user status');
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await createPlatformUser(form);
      setSuccess(`User ${form.name} (${form.role}) created successfully!`);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'ADMIN', workspaceId: workspaces[0]?.id || '' });
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create platform user');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SuperAdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#f8fafc', margin: '0 0 8px 0' }}>
            Platform User Accounts
          </h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '15px' }}>
            Overview and search of all Super Admin, Company Admin, and Agent user accounts across tenants.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowModal(true);
            setError('');
            setSuccess('');
          }}
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
          Add Platform User
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
            placeholder="Search by user name or email..."
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
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
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
          <option value="">All Roles</option>
          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          <option value="ADMIN">ADMIN</option>
          <option value="AGENT">AGENT</option>
        </select>
      </div>

      {/* Users Table */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', backgroundColor: '#0f172a' }}>
                <th style={{ padding: '16px' }}>User Name</th>
                <th style={{ padding: '16px' }}>Email</th>
                <th style={{ padding: '16px' }}>Role</th>
                <th style={{ padding: '16px' }}>Company Workspace</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px' }}>Created</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                    Loading platform users...
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                    No users found matching criteria.
                  </td>
                </tr>
              ) : (
                data.items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '16px', fontWeight: '600', color: '#f8fafc' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.role === 'SUPER_ADMIN' ? <FiShield style={{ color: '#38bdf8' }} /> : <FiUsers style={{ color: '#94a3b8' }} />}
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#cbd5e1' }}>{item.email}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: item.role === 'SUPER_ADMIN' ? 'rgba(56, 189, 248, 0.2)' : item.role === 'ADMIN' ? 'rgba(167, 139, 250, 0.15)' : '#334155',
                        color: item.role === 'SUPER_ADMIN' ? '#38bdf8' : item.role === 'ADMIN' ? '#a78bfa' : '#cbd5e1',
                      }}>
                        {item.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#cbd5e1' }}>
                      {item.role === 'SUPER_ADMIN' ? (
                        <span style={{ color: '#38bdf8', fontStyle: 'italic', fontSize: '13px' }}>Global Platform Operator</span>
                      ) : (
                        item.workspace?.name || 'N/A'
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: item.isActive ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                        color: item.isActive ? '#34d399' : '#f87171',
                      }}>
                        {item.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#94a3b8', fontSize: '13px' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      {item.role !== 'SUPER_ADMIN' && (
                        <button
                          onClick={() => handleToggleUserActive(item)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: item.isActive ? 'rgba(248, 113, 113, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                            color: item.isActive ? '#f87171' : '#34d399',
                            border: `1px solid ${item.isActive ? 'rgba(248, 113, 113, 0.3)' : 'rgba(52, 211, 153, 0.3)'}`,
                            borderRadius: '6px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {item.isActive ? <FiUserX /> : <FiUserCheck />}
                          {item.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to Create Platform User */}
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
              Add Platform User Account
            </h2>

            <form onSubmit={handleCreateUser}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  Temporary Password * (Min 8 chars: 1 upper, 1 lower, 1 digit, 1 special)
                </label>
                <input
                  type="password"
                  required
                  placeholder="e.g. Pass123!"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  User Role *
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                >
                  <option value="ADMIN">ADMIN (Company Administrator)</option>
                  <option value="AGENT">AGENT (Company Employee / Agent)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Platform Operator)</option>
                </select>
              </div>

              {form.role !== 'SUPER_ADMIN' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                    Assigned Company Workspace *
                  </label>
                  <select
                    required
                    value={form.workspaceId}
                    onChange={(e) => setForm({ ...form, workspaceId: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                  >
                    {workspaces.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.slug})
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  disabled={submitting}
                  style={{ padding: '10px 20px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {submitting ? 'Creating...' : 'Create Platform User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
