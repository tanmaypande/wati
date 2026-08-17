import { useEffect, useMemo, useRef, useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import TemplatePreview from './TemplatePreview';

const createDefaultForm = () => ({
  name: '',
  category: 'Marketing',
  language: 'English',
  status: 'PENDING',
  body: 'Hello {{1}},\n\nYour order {{2}} has been confirmed.\n\nThank you for choosing ConvoNest.',
});

function extractVariables(body = '') {
  const matches = body.match(/\{\{\d+\}\}/g) || [];
  return [...new Set(matches)];
}

export default function TemplateModal({ open, template, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(createDefaultForm());
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      if (template) {
        setForm({
          name: template.name || '',
          category: template.category || 'Marketing',
          language: template.language || 'English',
          status: template.status || 'PENDING',
          body: template.body || '',
        });
      } else {
        setForm(createDefaultForm());
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [open, template]);

  const detectedVariables = useMemo(() => extractVariables(form.body), [form.body]);

  if (!open) return null;

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleAddVariable = () => {
    const nextIndex = detectedVariables.length ? Math.max(...detectedVariables.map((token) => Number(token.replace(/\D/g, '')))) + 1 : 1;
    const token = `{{${nextIndex}}}`;
    const cursor = textareaRef.current?.selectionStart ?? form.body.length;
    const nextBody = `${form.body.slice(0, cursor)}${token}${form.body.slice(cursor)}`;
    setForm((current) => ({ ...current, body: nextBody }));
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) {
        const newCursor = cursor + token.length;
        el.focus();
        el.setSelectionRange(newCursor, newCursor);
      }
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="template-modal-overlay" role="presentation" onClick={onClose}>
      <div className="template-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="template-modal__header">
          <div>
            <p className="template-modal__eyebrow">Template builder</p>
            <h2>{template ? 'Edit template' : 'Create template'}</h2>
          </div>
          <button className="template-icon-btn" type="button" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form className="template-modal__form" onSubmit={handleSubmit}>
          <div className="template-modal__content">
            <div className="template-form-grid">
              <label className="template-input-group">
                <span>Template Name</span>
                <input required value={form.name} onChange={handleChange('name')} placeholder="Order Confirmation" />
              </label>

              <label className="template-input-group">
                <span>Category</span>
                <select value={form.category} onChange={handleChange('category')}>
                  <option value="Marketing">Marketing</option>
                  <option value="Utility">Utility</option>
                  <option value="Authentication">Authentication</option>
                </select>
              </label>

              <label className="template-input-group">
                <span>Language</span>
                <select value={form.language} onChange={handleChange('language')}>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </label>

              <label className="template-input-group">
                <span>Status</span>
                <select value={form.status} onChange={handleChange('status')}>
                  <option value="APPROVED">Approved</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </label>
            </div>

            <div className="template-input-group">
              <div className="template-input-group__header">
                <span>Message Body</span>
                <button className="template-chip-btn" type="button" onClick={handleAddVariable}>
                  <FiPlus /> Add Variable
                </button>
              </div>
              <textarea
                ref={textareaRef}
                required
                rows={8}
                value={form.body}
                onChange={handleChange('body')}
                placeholder="Write your WhatsApp template message"
              />
            </div>

            <div className="template-variable-panel">
              <h3>Variables detected</h3>
              <div className="template-variable-list">
                {detectedVariables.length ? (
                  detectedVariables.map((token) => <span key={token} className="template-variable-pill">{token}</span>)
                ) : (
                  <p className="template-variable-empty">No variables yet. Add one to personalize the message.</p>
                )}
              </div>
            </div>
          </div>

          <div className="template-modal__footer">
            <div className="template-preview-panel">
              <TemplatePreview body={form.body} />
            </div>
            <div className="template-modal__actions">
              <button className="template-btn template-btn--secondary" type="button" onClick={onClose}>
                Cancel
              </button>
              <button className="template-btn template-btn--primary" type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : template ? 'Save Changes' : 'Create Template'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
