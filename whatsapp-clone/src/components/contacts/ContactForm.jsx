import React, { useState, useEffect } from 'react';
import './ContactForm.css';

// ContactForm: reusable for Add and Edit
export default function ContactForm({
  initialData = {},
  onSave,
  onCancel,
  mode = 'add', // 'add' or 'edit'
}) {
  const [name, setName] = useState(initialData.name || '');
  const [phone, setPhone] = useState(initialData.phone || '');
  const [email, setEmail] = useState(initialData.email || '');
  const [avatar, setAvatar] = useState(initialData.avatar || '');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Update when initialData changes (for edit)
    setName(initialData.name || '');
    setPhone(initialData.phone || '');
    setEmail(initialData.email || '');
    setAvatar(initialData.avatar || '');
  }, [initialData]);

  function validate() {
    const err = {};
    if (!name.trim()) err.name = 'Name is required';
    if (!phone.trim()) err.phone = 'Phone is required';
    if (!email.trim()) err.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) err.email = 'Email is invalid';
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  function handleSave(e) {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...initialData, name: name.trim(), phone: phone.trim(), email: email.trim(), avatar: avatar.trim() };
    onSave && onSave(payload);
  }

  return (
    <div className="cf-overlay">
      <div className="cf-modal" role="dialog" aria-modal="true" aria-label={mode === 'add' ? 'Add contact' : 'Edit contact'}>
        <h3 className="cf-title">{mode === 'add' ? 'Add Contact' : 'Edit Contact'}</h3>

        <form className="cf-form" onSubmit={handleSave}>
          <label className="cf-field">
            <span className="cf-label">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name && <div className="cf-error">{errors.name}</div>}
          </label>

          <label className="cf-field">
            <span className="cf-label">Phone</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            {errors.phone && <div className="cf-error">{errors.phone}</div>}
          </label>

          <label className="cf-field">
            <span className="cf-label">Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <div className="cf-error">{errors.email}</div>}
          </label>

          <label className="cf-field">
            <span className="cf-label">Profile Image URL</span>
            <input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." />
          </label>

          <div className="cf-actions">
            <button type="button" className="btn btn--ghost" onClick={() => onCancel && onCancel()}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
