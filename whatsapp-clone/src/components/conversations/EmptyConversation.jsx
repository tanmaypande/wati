import React from 'react';
import './EmptyConversation.css';
import { FiMessageSquare } from 'react-icons/fi';

export default function EmptyConversation({ onAdd }) {
  return (
    <div className="empty-conversation">
      <div className="empty-conversation__icon">
        <FiMessageSquare />
      </div>
      <h3>No Conversations</h3>
      <p>Start chatting with a customer.</p>
      {onAdd && (
        <button className="empty-conversation__button" onClick={() => onAdd && onAdd()}>
          Start Conversation
        </button>
      )}
    </div>
  );
}
