import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiUserCheck,
  FiMessageSquare,
  FiSend,
  FiFileText,
  FiCheckCircle,
  FiPlus,
  FiSettings,
  FiShield,
  FiRefreshCw,
  FiSmartphone,
  FiUser
} from "react-icons/fi";
import "../styles/dashboard.css";
import { fetchOverview, fetchRecent, fetchMessagesChart } from "../services/dashboardApi";
import { getAccessToken } from "../services/tokenService";
import { API_ORIGIN } from "../services/api";
import { io } from "socket.io-client";
import { useAuth } from "../context/useAuth";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    whatsappPhoneNumberId: null,
    workspace: null,
  });

  const [recent, setRecent] = useState([]);
  const [messagesToday, setMessagesToday] = useState(0);
  const [broadcastSent, setBroadcastSent] = useState(0);
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchOverview();
      setOverview(data || {});

      const recentChats = await fetchRecent(10);
      setRecent(recentChats || []);

      const points = await fetchMessagesChart(7);
      if (Array.isArray(points) && points.length > 0) {
        const last = points[points.length - 1];
        setMessagesToday(last.count || 0);
      } else {
        setMessagesToday(0);
      }
      
      setBroadcastSent(data?.broadcastCount || 0);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    const token = getAccessToken();
    const socket = io(API_ORIGIN, {
      autoConnect: false,
      transports: ["websocket"],
      auth: token ? { token } : undefined,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("dashboard:subscribe", {});
    });

    socket.on("dashboard:update", () => {
      void loadData();
    });

    socket.connect();

    return () => {
      window.clearTimeout(timer);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [loadData]);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  const companyName = overview.workspace?.name || user?.workspaceName || 'Your Company Workspace';

  return (
    <div className="dashboard">
      {/* Super Admin / Workspace Header */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>
              {isSuperAdmin ? `${companyName} Dashboard` : 'Employee Workspace'}
            </h1>
            {isSuperAdmin && (
              <span style={{ backgroundColor: 'rgba(37, 211, 102, 0.15)', color: '#10b981', border: '1px solid rgba(37, 211, 102, 0.3)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                Company Super Admin
              </span>
            )}
          </div>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.925rem' }}>
            Welcome back, <strong>{user?.name || user?.email || 'User'}</strong> • Scoped live metrics for {companyName}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {isSuperAdmin && (
            <>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/agents')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem' }}
              >
                <FiPlus /> Add Employee
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/settings')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem' }}
              >
                <FiSettings /> WhatsApp Config
              </button>
            </>
          )}
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => loadData()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', fontSize: '0.875rem' }}
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Super Admin Metric Cards Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="stat-card" style={{ padding: '20px', borderRadius: '12px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Contacts</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(37, 211, 102, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiUsers style={{ fontSize: '1.2rem' }} />
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>{overview.totalContacts ?? 0}</h2>
          <small style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Registered company contacts</small>
        </div>

        <div className="stat-card" style={{ padding: '20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Team Employees</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiUserCheck style={{ fontSize: '1.2rem' }} />
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>{overview.totalEmployees ?? 0}</h2>
          <small style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Active workspace agents</small>
        </div>

        <div className="stat-card" style={{ padding: '20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Conversations</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiMessageSquare style={{ fontSize: '1.2rem' }} />
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>{overview.totalConversations ?? 0}</h2>
          <small style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Customer chat threads</small>
        </div>

        <div className="stat-card" style={{ padding: '20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Open Chats</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiCheckCircle style={{ fontSize: '1.2rem' }} />
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>{overview.activeConversations ?? 0}</h2>
          <small style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Active customer queries</small>
        </div>

        <div className="stat-card" style={{ padding: '20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Broadcast Campaigns</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(236, 72, 153, 0.12)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiSend style={{ fontSize: '1.2rem' }} />
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>{overview.broadcastCount ?? 0}</h2>
          <small style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Outbound broadcasts</small>
        </div>

        <div className="stat-card" style={{ padding: '20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Message Templates</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(14, 165, 233, 0.12)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiFileText style={{ fontSize: '1.2rem' }} />
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>{overview.templatesCount ?? 0}</h2>
          <small style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Approved WhatsApp templates</small>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="dashboard-bottom">
        {/* Recent Conversations */}
        <div className="recent-chats">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Recent Company Conversations</h3>
            <button
              className="btn btn-sm btn-outline-secondary"
              type="button"
              onClick={() => navigate('/chats')}
            >
              View All Chats
            </button>
          </div>

          {recent.length === 0 && (
            <div className="chat-item">
              <span>No recent conversations in your workspace</span>
            </div>
          )}

          {recent.map((c) => (
            <div
              className="chat-item"
              key={c.id}
              onClick={() => navigate('/chats')}
              style={{ cursor: 'pointer' }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(37, 211, 102, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <FiUser style={{ fontSize: '1rem' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#1f2937' }}>
                    {c.contact?.name || c.contact?.phone || 'Customer'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    {c.lastMessage?.content ? (c.lastMessage.content.length > 40 ? c.lastMessage.content.substring(0, 40) + '...' : c.lastMessage.content) : 'No messages yet'}
                  </div>
                </div>
              </span>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: c.status === 'OPEN' ? 'rgba(37, 211, 102, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                  color: c.status === 'OPEN' ? '#10b981' : '#6b7280',
                  marginRight: '8px',
                }}>
                  {c.status}
                </span>
                <small style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                  {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </small>
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp & Company Status Card */}
        <div className="status-card">
          <h3>WhatsApp API Status</h3>

          <div className="status">
            <span className={overview.whatsappStatus === 'CONNECTED' ? 'online' : 'offline'}></span>
            {overview.whatsappStatus === 'CONNECTED' ? 'Connected & Active' : 'Configuration Pending'}
          </div>

          {overview.whatsappPhoneNumberId && (
            <div style={{ fontSize: '0.825rem', color: '#6b7280', marginTop: '6px' }}>
              Phone ID: <code style={{ fontSize: '0.8rem' }}>{overview.whatsappPhoneNumberId}</code>
            </div>
          )}

          <hr />

          <p>Messages Today</p>
          <h2>{messagesToday}</h2>

          <p>Broadcasts Delivered</p>
          <h2>{broadcastSent}</h2>

          {isSuperAdmin && (
            <div style={{ marginTop: '16px' }}>
              <button
                className="btn btn-outline-primary btn-sm"
                style={{ width: '100%', borderRadius: '6px' }}
                onClick={() => navigate('/settings')}
              >
                <FiSmartphone style={{ marginRight: '6px' }} /> Manage WhatsApp Setup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;




