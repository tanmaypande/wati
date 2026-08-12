export default function AnalyticsRecentActivity({ recent = [], templates = [], broadcasts = [] }) {
  // Merge recent conversations, templates, broadcasts by date
  const activities = [];
  recent.forEach((r) => activities.push({ type: 'conversation', id: r.id, text: `Conversation with ${r.contact?.name || r.contact?.phone}`, ts: r.updatedAt }));
  templates.slice(0, 6).forEach((t) => activities.push({ type: 'template', id: t.id, text: `Template created: ${t.name}`, ts: t.createdAt }));
  broadcasts.slice(0, 6).forEach((b) => activities.push({ type: 'broadcast', id: b.id, text: `Broadcast created: ${b.title}`, ts: b.createdAt }));

  activities.sort((a, b) => new Date(b.ts) - new Date(a.ts));

  return (
    <div className="recent-activity" style={{ marginTop: 20 }}>
      <h3>Recent Activity</h3>
      {activities.length === 0 && <div>No recent activity</div>}
      {activities.map((a) => (
        <div key={`${a.type}-${a.id}`} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>{a.text}</div>
            <small style={{ color: '#6b7280' }}>{new Date(a.ts).toLocaleString()}</small>
          </div>
        </div>
      ))}
    </div>
  );
}
