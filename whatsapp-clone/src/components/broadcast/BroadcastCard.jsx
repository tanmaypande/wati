import { FiMoreVertical } from 'react-icons/fi';
import './BroadcastCard.css';

export default function BroadcastCard({
  broadcast = {},
  onOpenDetails,
  onAction,
}) {
  const name = broadcast.title || broadcast.name || 'Untitled broadcast';
  const message = broadcast.message || 'No message available yet.';
  const recipientsCount = broadcast.recipientCount ?? broadcast.recipientsCount ?? (broadcast.recipientIds?.length || 0);
  const sent = broadcast.sent ?? (broadcast.status === 'Draft' ? 0 : recipientsCount);
  const failed = broadcast.failed ?? 0;
  const pending = broadcast.pending ?? 0;
  const status = broadcast.status || 'Sent';
  const createdAt = broadcast.createdAt || '';

  const statusClass = {
    Sent: 'broadcast-card__status--sent',
    Scheduled: 'broadcast-card__status--scheduled',
    Failed: 'broadcast-card__status--failed',
    Draft: 'broadcast-card__status--draft',
  }[status] || 'broadcast-card__status--sent';

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
