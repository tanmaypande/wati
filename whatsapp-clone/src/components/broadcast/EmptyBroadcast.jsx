import { FiSend } from 'react-icons/fi';
import './EmptyBroadcast.css';

export default function EmptyBroadcast({ onCreate }) {
  return (
    <div className="empty-broadcast">
      <div className="empty-broadcast__illustration" aria-hidden="true">
        <div className="empty-broadcast__shape empty-broadcast__shape--circle" />
        <div className="empty-broadcast__shape empty-broadcast__shape--bubble" />
        <div className="empty-broadcast__shape empty-broadcast__shape--message" />
      </div>
      <div className="empty-broadcast__content">
        <h2>No Broadcasts Yet</h2>
        <p>Ready to engage your audience with a professional message? Create your first broadcast campaign.</p>
        <button type="button" className="empty-broadcast__button" onClick={() => onCreate && onCreate()}>
          <FiSend /> Create Broadcast
        </button>
      </div>
    </div>
  );
}
