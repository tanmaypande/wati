import { useEffect, useState } from 'react';
import '../styles/dashboard.css';
import './Analytics.css';
import { fetchOverview, fetchRecent, fetchMessagesChart } from '../services/dashboardApi';
import * as templateApi from '../services/templateApi';
import * as broadcastApi from '../services/broadcastApi';

import AnalyticsHeader from '../components/analytics/AnalyticsHeader';
import AnalyticsStats from '../components/analytics/AnalyticsStats';
import AnalyticsCharts from '../components/analytics/AnalyticsCharts';
import AnalyticsRecentActivity from '../components/analytics/AnalyticsRecentActivity';

export default function Analytics() {
  const [range, setRange] = useState('7'); // days
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [messagesSeries, setMessagesSeries] = useState([]);
  const [recent, setRecent] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [error, setError] = useState(null);

  async function loadData(days) {
    setError(null);
    setLoading(true);
    try {
      const [ov, msgs, recentChats, tpls, bcs] = await Promise.all([
        fetchOverview(),
        fetchMessagesChart(days),
        fetchRecent(8),
        templateApi.getTemplates(),
        broadcastApi.listBroadcasts(),
      ]);

      setOverview(ov || {});
      setMessagesSeries(Array.isArray(msgs) ? msgs : []);
      setRecent(Array.isArray(recentChats) ? recentChats : []);
      setTemplates(Array.isArray(tpls) ? tpls : []);
      setBroadcasts(Array.isArray(bcs) ? bcs : []);
    } catch (err) {
      console.error('Failed to load analytics', err);
      setError('Unable to load analytics data. Try again');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData(Number(range));
  }, [range]);

  return (
    <div className="dashboard">
      <AnalyticsHeader range={range} setRange={setRange} />

      {loading && (
        <div className="stat-card" style={{ padding: 30 }}>Loading analytics...</div>
      )}

      {error && <div className="stat-card">{error}</div>}

      {!loading && !error && (
        <>
          <AnalyticsStats overview={overview} messagesSeries={messagesSeries} />

          <div className="dashboard-bottom" style={{ marginTop: 20 }}>
            <div>
              <AnalyticsCharts overview={overview} messagesSeries={messagesSeries} />

              <div className="stat-card" style={{ marginTop: 20 }}>
                <h3>Broadcast Performance</h3>
                <p>Total Broadcasts</p>
                <h2>{overview?.broadcastCount || 0}</h2>
                <p>Messages: {messagesSeries.reduce((s, p) => s + (p.count || 0), 0)}</p>
              </div>

              <div className="stat-card" style={{ marginTop: 20 }}>
                <h3>Template Usage</h3>
                <p>Total Templates: {overview?.templatesCount || templates.length || 0}</p>
                <p>Approved: {templates.filter((t) => (t.status || '').toUpperCase() === 'APPROVED').length}</p>
                <p>Pending: {templates.filter((t) => (t.status || '').toUpperCase() === 'PENDING').length}</p>
                <p>Rejected: {templates.filter((t) => (t.status || '').toUpperCase() === 'REJECTED').length}</p>
                <h4 style={{ marginTop: 12 }}>Recent Templates</h4>
                <ul>
                  {templates.slice(0, 5).map((t) => (
                    <li key={t.id}>{t.name} — {t.status}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <div className="stat-card">
                <h3>Response Rate</h3>
                <h2>{overview && overview.totalConversations ? `${Math.round(((overview.totalConversations - overview.closedConversations) / overview.totalConversations) * 100)}%` : '0%'}</h2>
                <p>Sent Messages: {messagesSeries.reduce((s, p) => s + (p.sent || 0), 0)}</p>
                <p>Received Messages: {messagesSeries.reduce((s, p) => s + (p.received || 0), 0)}</p>
              </div>

              <AnalyticsRecentActivity recent={recent} templates={templates} broadcasts={broadcasts} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
