import { FiFilter, FiPlus, FiSearch, FiGrid, FiList } from 'react-icons/fi';

export default function TemplateFilters({ filters, onFilterChange, onCreate, viewMode, onViewModeChange }) {
  const handleChange = (key) => (event) => {
    onFilterChange(key, event.target.value);
  };

  return (
    <div className="template-filters">
      <div className="template-filters__search">
        <FiSearch />
        <input
          type="search"
          value={filters.search}
          onChange={handleChange('search')}
          placeholder="Search templates..."
        />
      </div>

      <div className="template-filters__controls">
        <div className="template-filters__select">
          <FiFilter />
          <select value={filters.category} onChange={handleChange('category')}>
            <option value="all">All Categories</option>
            <option value="Marketing">Marketing</option>
            <option value="Utility">Utility</option>
            <option value="Authentication">Authentication</option>
          </select>
        </div>

        <div className="template-filters__select">
          <FiFilter />
          <select value={filters.status} onChange={handleChange('status')}>
            <option value="all">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="template-filters__select">
          <FiFilter />
          <select value={filters.language} onChange={handleChange('language')}>
            <option value="all">All Languages</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
          </select>
        </div>

        <div className="template-filters__select">
          <FiFilter />
          <select value={filters.sort} onChange={handleChange('sort')}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
          </select>
        </div>

        <div className="template-view-toggle">
          <button
            type="button"
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => onViewModeChange('grid')}
          >
            <FiGrid /> Grid
          </button>
          <button
            type="button"
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => onViewModeChange('list')}
          >
            <FiList /> List
          </button>
        </div>

        <button className="template-btn template-btn--primary" type="button" onClick={onCreate}>
          <FiPlus /> Create Template
        </button>
      </div>
    </div>
  );
}
