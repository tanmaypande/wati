import React from 'react';
import './ConversationFilters.css';
import { FiSearch } from 'react-icons/fi';

export default function ConversationFilters({
  searchValue = '',
  onSearch,
  status = 'All',
  onStatusChange,
  sort = 'Newest',
  onSortChange,
}) {
  return (
    <div className="conversation-filters">
      <div className="conversation-filters__search">
        <FiSearch className="conversation-filters__icon" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearch && onSearch(e.target.value)}
          placeholder="Search conversations..."
        />
      </div>

      <div className="conversation-filters__selects">
        <label className="conversation-filters__field">
          <span>Status</span>
          <select value={status} onChange={(e) => onStatusChange && onStatusChange(e.target.value)}>
            <option>All</option>
            <option>Open</option>
            <option>Pending</option>
            <option>Closed</option>
          </select>
        </label>

        <label className="conversation-filters__field">
          <span>Sort</span>
          <select value={sort} onChange={(e) => onSortChange && onSortChange(e.target.value)}>
            <option>Newest</option>
            <option>Oldest</option>
          </select>
        </label>
      </div>
    </div>
  );
}
