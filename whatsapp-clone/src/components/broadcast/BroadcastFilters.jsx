import { FiSearch, FiFilter, FiPlus } from 'react-icons/fi';
import './BroadcastFilters.css';

export default function BroadcastFilters({
  query = '',
  status = 'All',
  onSearch,
  onStatusChange,
  onCreate,
}) {
  return (
    <div className="broadcast-filters">
      <div className="broadcast-filters__search">
        <FiSearch />
        <input
          type="search"
          value={query}
          onChange={(event) => onSearch && onSearch(event.target.value)}
          placeholder="Search broadcasts"
          aria-label="Search broadcasts"
        />
      </div>

      <div className="broadcast-filters__controls">
        <button type="button" className="broadcast-filters__status-button" aria-label="Filter options">
          <FiFilter />
          {status}
        </button>

        <select
          className="broadcast-filters__dropdown"
          value={status}
          onChange={(event) => onStatusChange && onStatusChange(event.target.value)}
        >
          <option value="All">All broadcasts</option>
          <option value="Sent">Sent</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Failed">Failed</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      <button type="button" className="broadcast-filters__create" onClick={() => onCreate && onCreate()}>
        <FiPlus />
        Create broadcast
      </button>
    </div>
  );
}
