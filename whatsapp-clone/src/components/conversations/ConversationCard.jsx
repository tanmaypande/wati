import React from 'react';
import './ConversationCard.css';
import { FiChevronRight } from 'react-icons/fi';

export default function ConversationCard({ conversation = {}, onSelect }) {
  const {
    contactName = 'Unknown Contact',
    lastMessage = 'No messages yet',
    lastTime = '',
    status = 'Open',
    assignedAgent = 'Unassigned',
    unreadCount = 0,
    avatar = '',
  } = conversation;

  const badgeClass = {
    Open: 'conversation-card__badge conversation-card__badge--open',
    Pending: 'conversation-card__badge conversation-card__badge--pending',
    Closed: 'conversation-card__badge conversation-card__badge--closed',
  }[status] || 'conversation-card__badge conversation-card__badge--closed';

  return (
    <button className="conversation-card" onClick={() => onSelect && onSelect(conversation)}>
      <div className="conversation-card__left">
        <div className="conversation-card__avatar">
          {avatar ? <img src={avatar} alt={`${contactName} avatar`} /> : <span>{contactName.charAt(0)}</span>}
        </div>
        <div className="conversation-card__content">
          <div className="conversation-card__header">
            <h4>{contactName}</h4>
            <span className="conversation-card__time">{lastTime}</span>
          </div>
          <p className="conversation-card__preview">{lastMessage}</p>
          <div className="conversation-card__meta">
            <span className={badgeClass}>{status}</span>
            <span className="conversation-card__agent">{assignedAgent}</span>
          </div>
        </div>
      </div>

      <div className="conversation-card__right">
        {unreadCount > 0 && <span className="conversation-card__unread">{unreadCount}</span>}
        <FiChevronRight />
      </div>
    </button>
  );
}
