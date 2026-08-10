import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

function getStatusClass(status) {
  switch (status) {
    case 'APPROVED':
      return 'template-status template-status--approved';
    case 'REJECTED':
      return 'template-status template-status--rejected';
    default:
      return 'template-status template-status--pending';
  }
}

function getVariables(body = '') {
  const matches = body.match(/\{\{\d+\}\}/g) || [];
  return [...new Set(matches)];
}

function truncatePreview(body = '') {
  const plainText = body.replace(/\s+/g, ' ').trim();
  return plainText.length > 110 ? `${plainText.slice(0, 110)}…` : plainText;
}

export default function TemplateCard({ template, onView, onEdit, onDelete }) {
  const variables = getVariables(template.body);
  const createdLabel = template.createdAt
    ? new Date(template.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently created';

  return (
    <article className="template-card">
      <div className="template-card__top">
        <div>
          <h3>{template.name || 'Untitled template'}</h3>
          <p className="template-card__meta">
            {template.category || 'Marketing'} • {template.language || 'English'}
          </p>
        </div>
        <span className={getStatusClass(template.status)}>{template.status || 'PENDING'}</span>
      </div>

      <p className="template-card__preview">“{truncatePreview(template.body)}”</p>

      <div className="template-card__details">
        <span>Variables: {variables.length}</span>
        <span>Created: {createdLabel}</span>
      </div>

      <div className="template-card__actions">
        <button className="template-action-btn template-action-btn--view" type="button" onClick={() => onView(template)}>
          <FiEye />
          View
        </button>
        <button className="template-action-btn template-action-btn--edit" type="button" onClick={() => onEdit(template)}>
          <FiEdit2 />
          Edit
        </button>
        <button className="template-action-btn template-action-btn--danger" type="button" onClick={() => onDelete(template)}>
          <FiTrash2 />
          Delete
        </button>
      </div>
    </article>
  );
}
