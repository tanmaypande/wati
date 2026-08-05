import React from 'react';
import './DeleteContactModal.css';

export default function DeleteContactModal({ isOpen = false, contactName = '', onCancel, onDelete }) {
  if (!isOpen) return null;

  return (
    <div className="dc-overlay">
      <div className="dc-modal" role="dialog" aria-modal="true" aria-label="Delete contact">
        <h3 className="dc-title">Delete Contact?</h3>
        <p className="dc-desc">Are you sure you want to delete {contactName ? `"${contactName}"` : 'this contact'}?</p>

        <div className="dc-actions">
          <button className="btn btn--ghost" onClick={() => onCancel && onCancel()}>
            Cancel
          </button>
          <button className="btn btn--danger" onClick={() => onDelete && onDelete()}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
