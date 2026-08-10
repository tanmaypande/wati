import { FiMoreVertical } from 'react-icons/fi';
import './BroadcastCard.css';

export default function BroadcastCard({
  broadcast = {},
  onOpenDetails,
  onAction,
}) {
  const {
    name = 'Untitled broadcast',
    message = 'No message available yet.',
    recipientsCount = 0,
    sent = 0,
    failed = 0,
    pending = 0,
    status = 'Draft',
    createdAt = '',
  } = broadcast;

  const statusClass = {
    Sent: 'broadcast-card__status--sent',
    Scheduled: 'broadcast-card__status--scheduled',
    Failed: 'broadcast-card__status--failed',
    Draft: 'broadcast-card__status--draft',
  }[status] || 'broadcast-card__status--draft';

  const createdLabel = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No date';

  return (
    <article className="broadcast-card">
      <div className="broadcast-card__top">
        <div>
          <h3>{name}</h3>
          <span className={`broadcast-card__status ${statusClass}`}>{status}</span>
        </div>
        <button
          type="button"
          className="broadcast-card__action"
          aria-label="Broadcast actions"
          onClick={() => onAction && onAction(broadcast)}
        >
          <FiMoreVertical />
        </button>
      </div>

      <p className="broadcast-card__preview">{message}</p>

      <div className="broadcast-card__metrics">
        <div>
          <span>Recipients</span>
          <strong>{recipientsCount}</strong>
        </div>
        <div>
          <span>Sent</span>
          <strong>{sent}</strong>
        </div>
        <div>
          <span>Failed</span>
          <strong>{failed}</strong>
        </div>
        <div>
          <span>Pending</span>
          <strong>{pending}</strong>
        </div>
      </div>

      <div className="broadcast-card__footer">
        <span className="broadcast-card__created">Created on {createdLabel}</span>
        <button
          type="button"
          className="broadcast-card__details"
          onClick={() => onOpenDetails && onOpenDetails(broadcast)}
        >
          View details
        </button>
      </div>
    </article>
  );
}
