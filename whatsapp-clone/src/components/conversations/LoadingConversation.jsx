import React from 'react';
import './LoadingConversation.css';

export default function LoadingConversation({ count = 4 }) {
  return (
    <div className="loading-conversation">
      {Array.from({ length: count }).map((_, index) => (
        <div className="loading-conversation__card" key={index}>
          <div className="loading-conversation__avatar skeleton" />
          <div className="loading-conversation__body">
            <div className="loading-conversation__line loading-conversation__line--short skeleton" />
            <div className="loading-conversation__line skeleton" />
            <div className="loading-conversation__line loading-conversation__line--medium skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}
