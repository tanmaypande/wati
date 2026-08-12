import './AnalyticsCharts.css';

function SimpleBar({ label, value, color }) {
  const max = 100;
  const width = Math.min(max, value);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <small>{label}</small>
        <small>{value}</small>
      </div>
      <div style={{ background: '#eee', height: 10, borderRadius: 6, marginTop: 6 }}>
        <div style={{ width: `${width}%`, background: color, height: '100%', borderRadius: 6 }} />
      </div>
    </div>
  );
}

function LineChart({ data = [] }) {
  // data: [{ day, sent, received }]
  const width = 600;
  const height = 140;
  if (!data || data.length === 0) return <div>No data</div>;
  const maxVal = Math.max(...data.map((d) => Math.max(d.sent || 0, d.received || 0, 1)));
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const ySent = height - ((d.sent || 0) / maxVal) * height;
    const yRecv = height - ((d.received || 0) / maxVal) * height;
    return { x, ySent, yRecv };
  });

  const pathSent = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.ySent.toFixed(1)}`).join(' ');
  const pathRecv = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yRecv.toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: height }}>
      <path d={pathSent} fill="none" stroke="#098fdc" strokeWidth={2} />
      <path d={pathRecv} fill="none" stroke="#10b981" strokeWidth={2} />
    </svg>
  );
}

export default function AnalyticsCharts({ overview = {}, messagesSeries = [] }) {
  const open = overview?.activeConversations || 0;
  const closed = overview?.closedConversations || 0;
  const pending = Math.max((overview?.totalConversations || 0) - open - closed, 0);

  return (
    <div>
      <div className="analytics-chart" style={{ marginBottom: 20 }}>
        <h3>Conversation Overview</h3>
        <SimpleBar label={`Open (${open})`} value={(open / Math.max(1, overview?.totalConversations || 1)) * 100} color="#098fdc" />
        <SimpleBar label={`Closed (${closed})`} value={(closed / Math.max(1, overview?.totalConversations || 1)) * 100} color="#10b981" />
        <SimpleBar label={`Pending (${pending})`} value={(pending / Math.max(1, overview?.totalConversations || 1)) * 100} color="#f59e0b" />
      </div>

      <div className="analytics-chart">
        <h3>Message Activity</h3>
        <LineChart data={messagesSeries.map((p) => ({ day: p.day, sent: p.sent || 0, received: p.received || 0 }))} />
      </div>
    </div>
  );
}
