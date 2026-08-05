import React from 'react';
import './ConversationDetails.css';

export default function ConversationDetails({ conversation = {} }) {
  const {
    contactName = 'Unknown Contact',
    phone = '-',
    email = '-',
    assignedAgent = 'Unassigned',
    status = 'Open',
    createdDate = '-',
    conversationId = '-',
    avatar = '',
  } = conversation;

  return (
    <div className="conversation-details">
      <div className="conversation-details__card">
        <div className="conversation-details__thumb">
          {avatar ? <img src={avatar} alt={`${contactName} avatar`} /> : <span>{contactName.charAt(0)}</span>}
        </div>
        <div className="conversation-details__heading">
          <h3>{contactName}</h3>
          <p>Assigned to {assignedAgent}</p>
        </div>
      </div>

      <div className="conversation-details__grid">
        <div className="conversation-details__item">
          <span>Phone</span>
          <strong>{phone}</strong>
        </div>
        <div className="conversation-details__item">
          <span>Email</span>
          <strong>{email}</strong>
        </div>
        <div className="conversation-details__item">
          <span>Status</span>
          <strong>{status}</strong>
        </div>
        <div className="conversation-details__item">
          <span>Created Date</span>
          <strong>{createdDate}</strong>
        </div>
        <div className="conversation-details__item conversation-details__item--wide">
          <span>Conversation ID</span>
          <strong>{conversationId}</strong>
        </div>
      </div>
    </div>
  );
}
