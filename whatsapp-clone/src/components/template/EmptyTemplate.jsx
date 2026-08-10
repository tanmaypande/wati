import { FiFileText, FiPlus } from 'react-icons/fi';

export default function EmptyTemplate({ onCreate }) {
  return (
    <div className="empty-template">
      <div className="empty-template__icon">
        <FiFileText />
      </div>
      <h3>No Templates Yet</h3>
      <p>Create reusable WhatsApp templates to speed up your customer communication.</p>
      <button className="template-btn template-btn--primary" type="button" onClick={onCreate}>
        <FiPlus /> Create Template
      </button>
    </div>
  );
}
