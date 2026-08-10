import { useEffect, useMemo, useState } from 'react';
import { FiEye, FiPlus } from 'react-icons/fi';
import TemplateFilters from '../components/template/TemplateFilters';
import TemplateList from '../components/template/TemplateList';
import TemplateModal from '../components/template/TemplateModal';
import DeleteTemplateModal from '../components/template/DeleteTemplateModal';
import LoadingTemplate from '../components/template/LoadingTemplate';
import TemplatePreview from '../components/template/TemplatePreview';
import '../styles/Template.css';
import { createTemplate, deleteTemplate, getTemplates, updateTemplate } from '../services/templateApi';

const initialFilters = {
  search: '',
  category: 'all',
  status: 'all',
  language: 'all',
  sort: 'newest',
};

export default function Template() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [viewMode, setViewMode] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadTemplates() {
    setLoading(true);
    setError('');

    try {
      const data = await getTemplates();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to load templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTemplates();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const stats = useMemo(() => {
    const approved = templates.filter((template) => template.status === 'APPROVED').length;
    const pending = templates.filter((template) => template.status === 'PENDING').length;
    const rejected = templates.filter((template) => template.status === 'REJECTED').length;

    return {
      total: templates.length,
      approved,
      pending,
      rejected,
    };
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    let nextTemplates = [...templates];
    const searchText = filters.search.trim().toLowerCase();

    if (searchText) {
      nextTemplates = nextTemplates.filter((template) => {
        const values = `${template.name || ''} ${template.category || ''} ${template.body || ''}`.toLowerCase();
        return values.includes(searchText);
      });
    }

    if (filters.category !== 'all') {
      nextTemplates = nextTemplates.filter((template) => template.category === filters.category);
    }

    if (filters.status !== 'all') {
      nextTemplates = nextTemplates.filter((template) => template.status === filters.status);
    }

    if (filters.language !== 'all') {
      nextTemplates = nextTemplates.filter((template) => template.language === filters.language);
    }

    switch (filters.sort) {
      case 'oldest':
        nextTemplates.sort((first, second) => new Date(first.createdAt) - new Date(second.createdAt));
        break;
      case 'name-asc':
        nextTemplates.sort((first, second) => (first.name || '').localeCompare(second.name || ''));
        break;
      case 'name-desc':
        nextTemplates.sort((first, second) => (second.name || '').localeCompare(first.name || ''));
        break;
      case 'newest':
      default:
        nextTemplates.sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
        break;
    }

    return nextTemplates;
  }, [filters, templates]);

  const openCreateModal = () => {
    setActiveTemplate(null);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (template) => {
    setActiveTemplate(template);
    setError('');
    setIsModalOpen(true);
  };

  const openPreviewModal = (template) => {
    setActiveTemplate(template);
    setIsPreviewOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveTemplate(null);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setActiveTemplate(null);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError('');

    try {
      if (activeTemplate) {
        const updated = await updateTemplate(activeTemplate.id, payload);
        setTemplates((current) => current.map((template) => (template.id === activeTemplate.id ? updated : template)));
      } else {
        const created = await createTemplate(payload);
        setTemplates((current) => [created, ...current]);
      }
      closeModal();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to save template');
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (template) => {
    setActiveTemplate(template);
    setIsDeleteOpen(true);
  };

  const handleDelete = async (template) => {
    setDeleting(true);
    setError('');

    try {
      await deleteTemplate(template.id);
      setTemplates((current) => current.filter((item) => item.id !== template.id));
      setIsDeleteOpen(false);
      setActiveTemplate(null);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to delete template');
    } finally {
      setDeleting(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="template-page">
      <div className="template-header">
        <div>
          <h1>Templates</h1>
          <p>Create, manage and reuse WhatsApp message templates.</p>
        </div>
        <button className="template-btn template-btn--primary" type="button" onClick={openCreateModal}>
          <FiPlus /> Create Template
        </button>
      </div>

      {error ? <div className="template-alert template-alert--danger">{error}</div> : null}

      <div className="template-stats">
        <div className="template-stat-card">
          <h3>{stats.total}</h3>
          <p>Total Templates</p>
        </div>
        <div className="template-stat-card">
          <h3>{stats.approved}</h3>
          <p>Approved</p>
        </div>
        <div className="template-stat-card">
          <h3>{stats.pending}</h3>
          <p>Pending</p>
        </div>
        <div className="template-stat-card">
          <h3>{stats.rejected}</h3>
          <p>Rejected</p>
        </div>
      </div>

      <TemplateFilters
        filters={filters}
        onFilterChange={updateFilter}
        onCreate={openCreateModal}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {loading ? (
        <LoadingTemplate />
      ) : (
        <TemplateList
          templates={filteredTemplates}
          onView={openPreviewModal}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          viewMode={viewMode}
          onCreate={openCreateModal}
        />
      )}

      <TemplateModal
        open={isModalOpen}
        template={activeTemplate}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <DeleteTemplateModal
        open={isDeleteOpen}
        template={activeTemplate}
        onClose={() => {
          setIsDeleteOpen(false);
          setActiveTemplate(null);
        }}
        onConfirm={handleDelete}
        deleting={deleting}
      />

      {isPreviewOpen && activeTemplate ? (
        <div className="template-modal-overlay" role="presentation" onClick={closePreview}>
          <div className="template-modal template-modal--preview" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="template-modal__header">
              <div>
                <p className="template-modal__eyebrow">Template preview</p>
                <h2>{activeTemplate.name}</h2>
              </div>
              <button className="template-icon-btn" type="button" onClick={closePreview}>
                <FiEye />
              </button>
            </div>
            <div className="template-modal__content">
              <TemplatePreview body={activeTemplate.body} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
