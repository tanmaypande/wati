import { useMemo } from 'react';
import { FiSearch, FiCheck, FiUsers } from 'react-icons/fi';
import './RecipientSelector.css';

export default function RecipientSelector({
  contacts = [],
  selectedIds = [],
  search = '',
  onSearch,
  onToggleContact,
  onSelectAll,
}) {
  const filteredContacts = useMemo(() => {
    if (!search || !search.trim()) return contacts;
    const q = search.toLowerCase().trim();
    return contacts.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q)
    );
  }, [contacts, search]);

  const selectedContacts = contacts.filter((contact) => selectedIds.includes(contact.id));
  const allSelected = filteredContacts.length > 0 && filteredContacts.every((c) => selectedIds.includes(c.id));

  return (
    <section className="recipient-selector">
      <div className="recipient-selector__header">
        <div className="recipient-selector__search">
          <FiSearch />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearch && onSearch(event.target.value)}
            placeholder="Search contacts"
            aria-label="Search contacts"
          />
        </div>

        <button
          type="button"
          className="recipient-selector__select-all"
          onClick={() => onSelectAll && onSelectAll(!allSelected)}
        >
          <FiUsers />
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      <div className="recipient-selector__chips">
        {selectedContacts.length > 0 ? (
          selectedContacts.map((contact) => (
            <span className="recipient-selector__chip" key={contact.id}>
              {contact.name}
            </span>
          ))
        ) : (
          <p className="recipient-selector__hint">Choose recipients to build your broadcast list.</p>
        )}
      </div>

      <div className="recipient-selector__list">
        {filteredContacts.length === 0 ? (
          <div className="recipient-selector__empty">
            {contacts.length === 0 ? 'No contacts found in your workspace.' : 'No contacts match your search.'}
          </div>
        ) : (
          filteredContacts.map((contact) => {
            const selected = selectedIds.includes(contact.id);
            return (
              <button
                key={contact.id}
                type="button"
                className={`recipient-selector__item ${selected ? 'selected' : ''}`}
                onClick={() => onToggleContact && onToggleContact(contact.id)}
              >
                <span className="recipient-selector__item-name">{contact.name}</span>
                <span className="recipient-selector__item-meta">{contact.phone || contact.email || 'No contact'}</span>
                {selected && (
                  <span className="recipient-selector__item-check">
                    <FiCheck />
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
