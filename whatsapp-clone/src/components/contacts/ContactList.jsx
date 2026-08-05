import React from 'react';
import './ContactList.css';
import ContactCard from './ContactCard';
import EmptyContacts from './EmptyContacts';

// ContactList: receives an array of contacts and renders ContactCard for each
export default function ContactList({ contacts = [], onEdit, onDelete, onAdd }) {
  // If no contacts, show the empty state
  if (!contacts || contacts.length === 0) {
    return <EmptyContacts onAdd={onAdd} />;
  }

  return (
    <div className="contact-list">
      {contacts.map((c) => (
        <ContactCard
          key={c.id || c.email || c.phone || c.name}
          contact={c}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
