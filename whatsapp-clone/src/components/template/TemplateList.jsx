import TemplateCard from './TemplateCard';
import EmptyTemplate from './EmptyTemplate';

export default function TemplateList({ templates, onView, onEdit, onDelete, viewMode, onCreate }) {
  if (!templates.length) {
    return <EmptyTemplate onCreate={onCreate} />;
  }

  return (
    <div className={`template-list ${viewMode === 'list' ? 'template-list--list' : 'template-list--grid'}`}>
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
