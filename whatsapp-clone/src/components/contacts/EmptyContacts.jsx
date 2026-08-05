import React from 'react';
import './EmptyContacts.css';
import { FiUsers, FiPlus } from 'react-icons/fi';

export default function EmptyContacts({ onAdd }) {
  return (
    <div className="empty-contacts">
      <div className="empty-contacts__ill">
        <FiUsers />
      </div>
      <h3>No Contacts Yet</h3>
      <p>Start by adding your first customer.</p>
      <button className="btn btn--primary" onClick={() => onAdd && onAdd()}>
        <FiPlus /> Add Contact
      </button>
    </div>
  );
}
