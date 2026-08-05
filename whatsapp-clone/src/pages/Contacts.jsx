import { useEffect, useMemo, useState } from 'react';
import { createContact, deleteContact, listContacts, updateContact } from '../services/contactsApi';
import '../styles/Contacts.css';

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  profileImage: '',
};

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  const loadContacts = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const result = await listContacts({ q: query, limit: 50 });
      setContacts(result?.items || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadContacts(search);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadContacts('');
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        const updated = await updateContact(editingId, form);
        setContacts((current) => current.map((contact) => (contact.id === editingId ? updated : contact)));
        setSuccess('Contact updated');
      } else {
        const created = await createContact(form);
        setContacts((current) => [created, ...current]);
        setSuccess('Contact added');
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to save contact');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (contact) => {
    setEditingId(contact.id);
    setForm({
      name: contact.name || '',
      phone: contact.phone || '',
      email: contact.email || '',
      profileImage: contact.profileImage || '',
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm('Delete this contact?')) return;

    try {
      await deleteContact(contactId);
      setContacts((current) => current.filter((contact) => contact.id !== contactId));
      setSuccess('Contact deleted');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to delete contact');
    }
  };

  const emptyState = useMemo(() => search.trim() && contacts.length === 0, [contacts.length, search]);

  return (
    <div className="contacts-page">
      <div className="contacts-header">
        <div>
          <h1>Contacts</h1>
          <p>Manage your WhatsApp contacts from one place.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => {
          setShowForm((current) => !current);
          setEditingId(null);
          setForm(emptyForm);
          setError('');
          setSuccess('');
        }}>
          {showForm ? 'Cancel' : '+ Add contact'}
        </button>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="contacts-toolbar">
        <div className="search-box">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, phone, or email"
          />
        </div>
        <button className="btn btn-outline-secondary" type="button" onClick={() => setSearch('')}>
          Clear
        </button>
      </div>

      {showForm ? (
        <form className="contact-form card" onSubmit={handleSubmit}>
          <div className="card-body">
            <h3>{editingId ? 'Edit contact' : 'Add contact'}</h3>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  required
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone</label>
                <input
                  className="form-control"
                  required
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Profile image URL</label>
                <input
                  className="form-control"
                  value={form.profileImage}
                  onChange={(event) => setForm((current) => ({ ...current, profileImage: event.target.value }))}
                />
              </div>
            </div>
            <div className="contact-form-actions">
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Create contact'}
              </button>
              <button className="btn btn-outline-secondary" type="button" onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(emptyForm);
              }}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : null}

      <div className="contacts-list card">
        <div className="card-body">
          {loading ? (
            <div className="contacts-empty">Loading contacts…</div>
          ) : emptyState ? (
            <div className="contacts-empty">No contacts match “{search}”.</div>
          ) : contacts.length === 0 ? (
            <div className="contacts-empty">No contacts yet. Add your first contact to get started.</div>
          ) : (
            <div className="contacts-grid">
              {contacts.map((contact) => (
                <div className="contact-card" key={contact.id}>
                  <div className="contact-card__avatar">
                    {contact.profileImage ? (
                      <img src={contact.profileImage} alt={contact.name || 'Contact'} />
                    ) : (
                      <span>{(contact.name || 'C').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="contact-card__body">
                    <h4>{contact.name || 'Unnamed contact'}</h4>
                    <p>{contact.phone}</p>
                    <p>{contact.email || 'No email provided'}</p>
                  </div>
                  <div className="contact-card__actions">
                    <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => handleEdit(contact)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => handleDelete(contact.id)}>
                      Delete
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

export default Contacts;
