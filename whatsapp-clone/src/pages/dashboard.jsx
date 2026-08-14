import { useEffect, useState, useRef } from "react";
import { FiUser } from "react-icons/fi";
import "../styles/dashboard.css";
import { fetchOverview, fetchRecent, fetchMessagesChart } from "../services/dashboardApi";
import { getAccessToken } from "../services/tokenService";
import { API_ORIGIN } from "../services/api";
import { io } from "socket.io-client";
import { useAuth } from "../context/useAuth";

function Dashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState({
    totalContacts: 0,
    totalEmployees: 0,
    totalConversations: 0,
    activeConversations: 0,
    openConversations: 0,
    pendingConversations: 0,
    closedConversations: 0,
    broadcastCount: 0,
    templatesCount: 0,
    whatsappStatus: 'INACTIVE',
  });

  const [recent, setRecent] = useState([]);
  const [messagesToday, setMessagesToday] = useState(0);
  const [broadcastSent, setBroadcastSent] = useState(0);

  const socketRef = useRef(null);

  const loadData = async () => {
    try {
      const data = await fetchOverview();
      setOverview(data || {});

      const recentChats = await fetchRecent(5);
      setRecent(recentChats || []);

      const points = await fetchMessagesChart(7);
      if (Array.isArray(points) && points.length > 0) {
        const last = points[points.length - 1];
        setMessagesToday(last.count || 0);
      } else {
        setMessagesToday(0);
      }
      
      // Use broadcastCount from overview for broadcastSent display
      setBroadcastSent(data?.broadcastCount || 0);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    // Setup socket connection for live updates using centralized API_ORIGIN
    const token = getAccessToken();
    const socket = io(API_ORIGIN, {
      autoConnect: false,
      transports: ["websocket"],
      auth: token ? { token } : undefined,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      // Join dashboard room
      socket.emit("dashboard:subscribe", {});
    });

    socket.on("dashboard:update", () => {
      // For simplicity, reload summary data when an update arrives
      void loadData();
    });

    socket.connect();

    return () => {
      window.clearTimeout(timer);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name || user?.email || 'User'}{user?.workspaceName ? ` • ${user.workspaceName}` : ''}</p>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <h2>{overview.totalContacts ?? 0}</h2>
          <p>Total Contacts</p>
        </div>

        <div className="stat-card">
          <h2>{overview.totalEmployees ?? 0}</h2>
          <p>Total Employees</p>
        </div>

        <div className="stat-card">
          <h2>{overview.totalConversations ?? 0}</h2>
          <p>Total Conversations</p>
        </div>

        <div className="stat-card">
          <h2>{overview.activeConversations ?? 0}</h2>
          <p>Open Conversations</p>
        </div>
      </div>
      {/* Bottom Section */}
      <div className="dashboard-bottom">
        <div className="recent-chats">
          <h3>Recent Conversations</h3>

          {recent.length === 0 && (
            <div className="chat-item">
              <span>No recent conversations</span>
            </div>
          )}

          {recent.map((c) => (
            <div className="chat-item" key={c.id}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <FiUser style={{ color: '#25D366', fontSize: '1.05rem' }} />
                {c.contact?.name || c.contact?.phone || 'Unknown'}
              </span>
              <small>{new Date(c.updatedAt).toLocaleString()}</small>
            </div>
          ))}
        </div>

        <div className="status-card">
          <h3>WhatsApp API Status</h3>

          <div className="status">
            <span className="online"></span>
            Connected
          </div>

          <hr />

          <p>Messages Today</p>
          <h2>{messagesToday}</h2>

          <p>Broadcast Sent</p>
          <h2>{broadcastSent}</h2>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;



