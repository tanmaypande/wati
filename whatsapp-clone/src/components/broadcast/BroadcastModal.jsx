import { useEffect, useMemo, useState } from 'react';
import RecipientSelector from './RecipientSelector';
import './BroadcastModal.css';
import * as templateApi from '../../services/templateApi';
import * as contactsApi from '../../services/contactsApi';
import * as broadcastApi from '../../services/broadcastApi';

export default function BroadcastModal({ open = false, onClose, onSuccess }) {
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [broadcastName, setBroadcastName] = useState('');
  const [message, setMessage] = useState('');
  const [variables, setVariables] = useState([]); // [{key:'1', value:''}, ...]

  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (!open) return;
    setLoadingTemplates(true);
    templateApi.getTemplates()
      .then((data) => setTemplates(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Failed to load templates', err))
      .finally(() => setLoadingTemplates(false));

    setContactsLoading(true);
    contactsApi.listContacts({ limit: 500 })
      .then((data) => setContacts(Array.isArray(data) ? data : (data?.items || [])))
      .catch((err) => console.error('Failed to load contacts', err))
      .finally(() => setContactsLoading(false));
  }, [open]);

  // derive approved templates first
  const approvedTemplates = useMemo(() => templates.filter((t) => (t.status || '').toUpperCase() === 'APPROVED'), [templates]);
  const otherTemplates = useMemo(() => templates.filter((t) => (t.status || '').toUpperCase() !== 'APPROVED'), [templates]);

  useEffect(() => {
    if (!selectedTemplateId) {
      setSelectedTemplate(null);
      return;
    }
    const t = templates.find((x) => x.id === selectedTemplateId) || null;
    setSelectedTemplate(t);
    if (t) {
      setMessage(t.body || '');
    }
  }, [selectedTemplateId, templates]);

  // detect variables in message like {{1}}, {{name}} (only numeric sequential expected but support any token inside {{}})
  useEffect(() => {
    const varRegex = /\{\{\s*([^\}]+?)\s*\}\}/g;
    const found = [];
    const seen = new Set();
    let m;
    while ((m = varRegex.exec(message || '')) !== null) {
      const key = m[1];
      if (!seen.has(key)) {
        seen.add(key);
        found.push(key);
      }
    }
    // map to objects preserving previous values if any
    setVariables((prev) => found.map((k) => {
      const existing = prev.find((p) => p.key === k);
      return { key: k, value: existing ? existing.value : '' };
    }));
  }, [message]);

  function handleToggleRecipient(id) {
    setSelectedRecipientIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleSelectAll(selectAll) {
    if (selectAll) setSelectedRecipientIds(contacts.map((c) => c.id));
    else setSelectedRecipientIds([]);
  }

  function renderTemplateOptions() {
    if (loadingTemplates) return <option>Loading templates...</option>;
    if (templates.length === 0) return <option value="">No templates available</option>;
    return (
      <>
        {approvedTemplates.map((t) => (
          <option key={t.id} value={t.id}>{`${t.name} — ${t.language || 'English'} (${t.status || 'APPROVED'})`}</option>
        ))}
        {otherTemplates.length > 0 && <option disabled>───────── Other templates ─────────</option>}
        {otherTemplates.map((t) => (
          <option key={t.id} value={t.id}>{`${t.name} — ${t.language || 'English'} (${t.status || 'PENDING'})`}</option>
        ))}
      </>
    );
  }

  function updateVariableValue(key, value) {
    setVariables((prev) => prev.map((p) => (p.key === key ? { ...p, value } : p)));
  }

  function substitutedMessage() {
    let result = message || '';
    variables.forEach((v) => {
      const token = new RegExp(`\\\\{\\\\{\\\\s*${escapeRegExp(v.key)}\\\\s*\\\\}\\\\}`, 'g');
      result = result.replace(token, v.value || '');
    });
    return result;
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&');
  }

  async function handleSave() {
    setError(null);
    setSuccessMessage(null);

    if (!broadcastName || !broadcastName.trim()) {
      setError('Broadcast name is required.');
      return;
    }
    const finalMsg = selectedTemplate ? substitutedMessage() : message;
    if (!finalMsg || !finalMsg.trim()) {
      setError('Please select a template or enter a broadcast message.');
      return;
    }
    // ensure variables filled
    for (const v of variables) {
      if (!v.value) {
        setError(`Please provide a value for variable {{${v.key}}}.`);
        return;
      }
    }
    if (selectedRecipientIds.length === 0) {
      setError('Please choose at least one recipient or select all contacts.');
      return;
    }

    const payload = {
      title: broadcastName.trim(),
      message: finalMsg.trim(),
      templateId: selectedTemplate?.id || null,
      recipientIds: selectedRecipientIds,
      recipientCount: selectedRecipientIds.length,
      status: 'SENT',
    };

    try {
      setSaving(true);
      await broadcastApi.createBroadcast(payload);
      setSuccessMessage('Broadcast created successfully.');
      setTimeout(() => {
        setSaving(false);
        onSuccess && onSuccess();
        onClose && onClose();
      }, 500);
    } catch (err) {
      console.error('Failed to save broadcast', err);
      setError(err?.response?.data?.message || 'Unable to create broadcast. Please try again.');
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="broadcast-modal__backdrop" role="dialog" aria-modal="true">
      <div className="broadcast-modal">
        <div className="broadcast-modal__header">
          <div>
            <h2>Create broadcast</h2>
            <p>Compose a message and select recipients for your broadcast campaign.</p>
          </div>
          <button type="button" className="broadcast-modal__close" onClick={onClose} aria-label="Close modal">×</button>
        </div>

        <div className="broadcast-modal__body">
          <div className="broadcast-modal__field">
            <label htmlFor="broadcast-name">Broadcast Name</label>
            <input id="broadcast-name" type="text" value={broadcastName} onChange={(e) => setBroadcastName(e.target.value)} placeholder="Enter broadcast name" />
          </div>

          <div className="broadcast-modal__field">
            <label htmlFor="select-template">Select Template (Optional)</label>
            <select id="select-template" value={selectedTemplateId || ''} onChange={(e) => setSelectedTemplateId(e.target.value || null)}>
              <option value="">-- Custom Message (No Template) --</option>
              {renderTemplateOptions()}
            </select>
          </div>

          {!selectedTemplate && (
            <div className="broadcast-modal__field">
              <label htmlFor="custom-message">Custom Broadcast Message</label>
              <textarea
                id="custom-message"
                className="form-control"
                rows="3"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your broadcast message here..."
              />
            </div>
          )}

          {selectedTemplate && (
            <div className="broadcast-modal__field template-preview">
              <h4>Template Details</h4>
              <div><strong>Name:</strong> {selectedTemplate.name}</div>
              <div><strong>Category:</strong> {selectedTemplate.category}</div>
              <div><strong>Language:</strong> {selectedTemplate.language}</div>
              <div><strong>Status:</strong> {selectedTemplate.status}</div>
              <div className="template-preview__message">
                <h5>Message Preview</h5>
                <pre>{selectedTemplate.body}</pre>
              </div>
            </div>
          )}

          {variables.length > 0 && (
            <div className="broadcast-modal__field variables">
              <h4>Message Variables</h4>
              {variables.map((v) => (
                <div className="broadcast-modal__variable" key={v.key}>
                  <label>Variable {'{{' + v.key + '}}'}</label>
                  <input type="text" value={v.value} onChange={(e) => updateVariableValue(v.key, e.target.value)} placeholder={`Value for {{${v.key}}}`} />
                </div>
              ))}
              <div className="broadcast-modal__preview">
                <h5>Final Preview</h5>
                <pre>{substitutedMessage()}</pre>
              </div>
            </div>
          )}

          <div className="broadcast-modal__field">
            <label>Recipients ({contacts.length} total contacts available)</label>
            <RecipientSelector
              contacts={contacts}
              selectedIds={selectedRecipientIds}
              search={contactSearch}
              onSearch={(q) => setContactSearch(q)}
              onToggleContact={handleToggleRecipient}
              onSelectAll={handleSelectAll}
            />
            <div className="broadcast-modal__selected-count">Selected: {selectedRecipientIds.length}</div>
          </div>

          {error && <div className="broadcast-modal__error">{error}</div>}
          {successMessage && <div className="broadcast-modal__success">{successMessage}</div>}
        </div>

        <div className="broadcast-modal__footer">
          <button type="button" className="broadcast-modal__cancel" onClick={onClose} disabled={saving}>Cancel</button>
          <button
            type="button"
            className="broadcast-modal__send"
            onClick={handleSave}
            disabled={saving || !broadcastName?.trim() || (!selectedTemplate && !message?.trim()) || selectedRecipientIds.length === 0}
          >
            {saving ? 'Saving...' : 'Save Broadcast'}
          </button>
        </div>
      </div>
    </div>
  );
}
