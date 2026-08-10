import './BroadcastDetails.css';

export default function BroadcastDetails({ broadcast = {}, recipients = [], onClose }) {
  const {
    name = 'Broadcast details',
    message = 'No message preview available.',
    status = 'Draft',
    createdAt = '',
    sentAt = '',
  } = broadcast;

  const sentTime = sentAt
    ? new Date(sentAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Not sent yet';

  const failedRecipients = recipients.filter((item) => item.status === 'Failed');
  const displayRecipients = recipients.length > 0 ? recipients : [];

  return (
    <aside className="broadcast-details">
      <div className="broadcast-details__header">
        <div>
          <h2>{name}</h2>
          <p>{status} • Created {createdAt ? new Date(createdAt).toLocaleDateString() : 'unknown'}</p>
        </div>
        <button type="button" className="broadcast-details__close" onClick={onClose} aria-label="Close details">
          ×
        </button>
      </div>

      <div className="broadcast-details__overview">
        <section>
          <h3>Message preview</h3>
          <p>{message}</p>
        </section>

        <section>
          <h3>Delivery status</h3>
          <div className="broadcast-details__metrics">
            <div>
              <span>Recipients</span>
              <strong>{displayRecipients.length}</strong>
            </div>
            <div>
              <span>Sent</span>
              <strong>{displayRecipients.filter((item) => item.status === 'Sent').length}</strong>
            </div>
            <div>
              <span>Failed</span>
              <strong>{failedRecipients.length}</strong>
            </div>
          </div>
        </section>
      </div>

      <div className="broadcast-details__summary">
        <div>
          <span>Sent time</span>
          <strong>{sentTime}</strong>
        </div>
        <div>
          <span>Failed recipients</span>
          <strong>{failedRecipients.length}</strong>
        </div>
      </div>

      <div className="broadcast-details__list">
        <div className="broadcast-details__list-header">
          <span>Recipient</span>
          <span>Status</span>
          <span>Contact</span>
        </div>
        {displayRecipients.length === 0 ? (
          <div className="broadcast-details__empty">No recipients available yet.</div>
        ) : (
          displayRecipients.map((recipient) => (
            <div className="broadcast-details__list-item" key={recipient.id || recipient.contact || recipient.name}>
              <div>
                <strong>{recipient.name || recipient.contact || 'Unknown recipient'}</strong>
              </div>
              <div>
                  <span className={`broadcast-details__status ${(recipient.status || 'draft').toLowerCase()}`}>{recipient.status || 'Draft'}</span>
              </div>
              <div>{recipient.contact || recipient.phone || 'No contact'}</div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
