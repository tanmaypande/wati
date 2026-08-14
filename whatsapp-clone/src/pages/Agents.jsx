import { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import { createWorkspaceAgent, deleteWorkspaceAgent, listWorkspaceAgents } from '../services/agentsApi';
import '../styles/Contacts.css';

function Agents() {
  const { user } = useAuth();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const loadAgents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listWorkspaceAgents();
      setAgents(data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAgents();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const created = await createWorkspaceAgent(form);
      setAgents((current) => [created, ...current]);
      setForm({ name: '', email: '', password: '' });
      setShowForm(false);
      setSuccess(`Agent ${created.name} created successfully!`);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to create agent');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (agentId, agentName) => {
    if (!window.confirm(`Deactivate agent "${agentName}"?`)) return;

    setError('');
    setSuccess('');
    try {
      await deleteWorkspaceAgent(agentId);
      setAgents((current) => current.filter((a) => a.id !== agentId));
      setSuccess(`Agent ${agentName} deactivated`);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to delete agent');
    }
  };

  if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN') {
    return (
      <div className="contacts-page" style={{ padding: '2rem' }}>
        <div className="alert alert-danger">
          <h3>Access Restricted</h3>
          <p>Only Company Super Admins can manage team employees and agents.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contacts-page">
      <div className="contacts-header">
        <div>
          <h1>Team Agents</h1>
          <p>Manage your workspace agents and team access.</p>
        </div>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            setShowForm((prev) => !prev);
            setError('');
            setSuccess('');
          }}
        >
          {showForm ? 'Cancel' : '+ Add Agent'}
        </button>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      {showForm ? (
        <form className="contact-form card" onSubmit={handleCreate}>
          <div className="card-body">
            <h3>Add New Agent</h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Create an agent account with a temporary password. The agent will belong to your workspace.
            </p>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Full Name</label>
                <input
                  className="form-control"
                  required
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Email Address</label>
                <input
                  className="form-control"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="agent@company.com"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Temporary Password</label>
                <input
                  className="form-control"
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Min 8 chars (Aa1!)"
                />
              </div>
            </div>
            <div className="contact-form-actions mt-3">
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create Agent Account'}
              </button>
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : null}

      <div className="contacts-list card mt-3">
        <div className="card-body">
          {loading ? (
            <div className="contacts-empty">Loading team agents…</div>
          ) : agents.length === 0 ? (
            <div className="contacts-empty">
              No agents in your workspace yet. Click "+ Add Agent" to create team accounts.
            </div>
          ) : (
            <div className="contacts-grid">
              {agents.map((agent) => (
                <div className="contact-card" key={agent.id}>
                  <div className="contact-card__avatar">
                    <span>{(agent.name || 'A').charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="contact-card__body">
                    <h4>{agent.name}</h4>
                    <p>{agent.email}</p>
                    <p style={{ color: '#10b981', fontWeight: 600, fontSize: '0.8rem' }}>
                      Role: AGENT
                    </p>
                  </div>
                  <div className="contact-card__actions">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      type="button"
                      onClick={() => handleDelete(agent.id, agent.name)}
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Agents;
