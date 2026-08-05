import React from 'react';
import './ContactSearch.css';
import { FiSearch, FiPlus } from 'react-icons/fi';

// ContactSearch: top search bar with add button
export default function ContactSearch({ value = '', onChange, onAdd }) {
  return (
    <div className="contact-search">
      <div className="contact-search__input">
        <FiSearch className="contact-search__icon" />
        <input
          type="text"
          placeholder="Search by name, phone or email"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
        />
      </div>

      <button className="btn btn--primary" onClick={() => onAdd && onAdd()}>
        <FiPlus /> Add Contact
      </button>
    </div>
  );
}
