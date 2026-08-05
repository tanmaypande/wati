import React from 'react';
import './ConversationList.css';
import ConversationCard from './ConversationCard';
import EmptyConversation from './EmptyConversation';

export default function ConversationList({ conversations = [], onSelect, onAdd }) {
  if (!conversations || conversations.length === 0) {
    return <EmptyConversation onAdd={onAdd} />;
  }

  return (
    <div className="conversation-list">
      {conversations.map((conversation) => (
        <ConversationCard
          key={conversation.id || conversation.contactName || conversation.lastTime}
          conversation={conversation}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
