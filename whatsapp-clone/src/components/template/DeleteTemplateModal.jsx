export default function DeleteTemplateModal({ open, template, onClose, onConfirm, deleting }) {
  if (!open || !template) return null;

  return (
    <div className="template-modal-overlay" role="presentation" onClick={onClose}>
      <div className="template-modal template-modal--confirm" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="template-modal__header">
          <div>
            <p className="template-modal__eyebrow">Delete template</p>
            <h2>Delete Template?</h2>
          </div>
        </div>

        <div className="template-modal__content">
          <p>
            Are you sure you want to delete <strong>{template.name}</strong>? This action cannot be undone.
          </p>
        </div>

        <div className="template-modal__actions template-modal__actions--end">
          <button className="template-btn template-btn--secondary" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="template-btn template-btn--danger" type="button" onClick={() => onConfirm(template)} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete Template'}
          </button>
        </div>
      </div>
    </div>
  );
}
