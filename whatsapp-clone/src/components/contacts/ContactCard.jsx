import React from 'react';
import './ContactCard.css';
import { FiMoreVertical, FiEdit2, FiTrash2 } from 'react-icons/fi';

// ContactCard: shows avatar, name, phone, email, and actions
export default function ContactCard({ contact = {}, onEdit, onDelete }) {
  const { name = 'Unknown', phone = '', email = '', avatar = '' } = contact;

  // Take first letter for avatar fallback
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className="contact-card">
      <button className="contact-card__menu" aria-label="more">
        <FiMoreVertical />
      </button>

      <div className="contact-card__main">
        <div className="contact-card__avatar">
          {avatar ? (
            <img src={avatar} alt={`${name} avatar`} />
          ) : (
            <div className="contact-card__initial">{initial}</div>
          )}
        </div>

        <div className="contact-card__info">
          <div className="contact-card__name">{name}</div>
          <div className="contact-card__meta">{phone}</div>
          <div className="contact-card__meta">{email}</div>
        </div>
      </div>

      <div className="contact-card__actions">
        {/* Edit button */}
        <button
          className="btn btn--ghost"
          onClick={() => onEdit && onEdit(contact)}
          aria-label="edit"
        >
          <FiEdit2 /> Edit
        </button>

        {/* Delete button */}
        <button
          className="btn btn--danger"
          onClick={() => onDelete && onDelete(contact)}
          aria-label="delete"
        >
          <FiTrash2 /> Delete
        </button>
      </div>
    </div>
  );
}
