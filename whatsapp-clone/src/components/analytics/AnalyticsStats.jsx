function StatCard({ value, label, hint }) {
  return (
    <div className="stat-card">
      <h2>{value}</h2>
      <p>{label}</p>
      {hint && <small style={{ color: '#6b7280' }}>{hint}</small>}
    </div>
  );
}

export default function AnalyticsStats({ overview = {}, messagesSeries = [] }) {
  const totalSent = messagesSeries.reduce((s, p) => s + (p.sent || 0), 0);
  const totalReceived = messagesSeries.reduce((s, p) => s + (p.received || 0), 0);

  return (
    <div className="analytics-cards">
      <StatCard value={overview?.totalContacts || 0} label="Total Contacts" />
      <StatCard value={overview?.totalConversations || 0} label="Total Conversations" />
      <StatCard value={totalSent} label="Messages Sent" />
      <StatCard value={totalReceived} label="Messages Received" />
    </div>
  );
}
