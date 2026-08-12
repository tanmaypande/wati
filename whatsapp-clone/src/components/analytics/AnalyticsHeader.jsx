export default function AnalyticsHeader({ range, setRange }) {
  return (
    <div className="analytics-header">
      <div>
        <h1>Analytics</h1>
        <p>Track your WhatsApp performance and engagement.</p>
      </div>

      <div>
        <select value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="1">Today</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>
    </div>
  );
}
