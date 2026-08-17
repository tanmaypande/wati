import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "../../styles/topbar.css";
import {
  FaBell,
  FaCog,
  FaQuestionCircle,
  FaUserCircle,
} from "react-icons/fa";

function TopBar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activePopover, setActivePopover] = useState(null);
  const popoverRoot = useRef(null);

  const displayName = user?.name || user?.email || "User";

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRoot.current && !popoverRoot.current.contains(event.target)) {
        setActivePopover(null);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setActivePopover(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function closePopovers() {
    setActivePopover(null);
  }

  function togglePopover(name) {
    setActivePopover((current) => (current === name ? null : name));
  }

  function handleNewChat() {
    closePopovers();
    navigate("/chats");
  }

  function handleOpenSettings() {
    closePopovers();
    navigate("/settings");
  }

  async function handleLogout() {
    closePopovers();
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="topbar" ref={popoverRoot}>
      <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button className="hamburger" aria-label="Toggle menu" onClick={() => onToggleSidebar && onToggleSidebar()}>
          ☰
        </button>
        <img src="/logo.png" alt="ConvoNest Logo" style={{ height: '32px', width: 'auto' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Dashboard</h2>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>Welcome back, {displayName} 👋</p>
        </div>
      </div>

      <div className="topbar-right">
        <button className="create-btn" type="button" onClick={handleNewChat}>
          + New Chat
        </button>

        <div className="topbar-icon-wrapper">
          <button
            type="button"
            className={`topbar-icon ${activePopover === "help" ? "active" : ""}`}
            onClick={() => togglePopover("help")}
            aria-label="Help"
          >
            <FaQuestionCircle />
          </button>
          {activePopover === "help" && (
            <div className="topbar-popover topbar-popover--right">
              <div className="popover-header">
                <span>Help & Support</span>
                <button
                  type="button"
                  className="popover-close"
                  onClick={() => setActivePopover(null)}
                  aria-label="Close help popover"
                >
                  ×
                </button>
              </div>
              <div className="popover-body">
                <p className="popover-title">Quick Help</p>
                <ul>
                  <li>How to manage contacts</li>
                  <li>How to create a broadcast</li>
                  <li>How to use templates</li>
                  <li>How to view analytics</li>
                </ul>
                <div className="popover-action">Contact Administrator</div>
              </div>
            </div>
          )}
        </div>

        <div className="topbar-icon-wrapper">
          <button
            type="button"
            className={`topbar-icon ${activePopover === "notifications" ? "active" : ""}`}
            onClick={() => togglePopover("notifications")}
            aria-label="Notifications"
          >
            <FaBell />
          </button>
          {activePopover === "notifications" && (
            <div className="topbar-popover topbar-popover--right">
              <div className="popover-header">
                <span>Notifications</span>
              </div>
              <div className="popover-body">
                <p className="popover-empty">No new notifications</p>
              </div>
            </div>
          )}
        </div>

        <div className="topbar-icon-wrapper">
          <button
            type="button"
            className="topbar-icon"
            onClick={handleOpenSettings}
            aria-label="Settings"
          >
            <FaCog />
          </button>
        </div>

        <div className="topbar-icon-wrapper">
          <button
            type="button"
            className={`topbar-profile-btn ${activePopover === "profile" ? "active" : ""}`}
            onClick={() => togglePopover("profile")}
            aria-label="Profile menu"
          >
            <div className="topbar-profile-avatar">
              <span>{(displayName || "U").charAt(0).toUpperCase()}</span>
            </div>
            <div className="topbar-profile-details">
              <span className="topbar-profile-name">{displayName}</span>
              <span className={`topbar-profile-role ${user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? 'admin' : 'agent'}`}>
                {user?.role || "USER"}
              </span>
            </div>
          </button>
          {activePopover === "profile" && (
            <div className="topbar-popover topbar-popover--right topbar-popover--profile">
              <div className="popover-user">
                <div className="popover-user-header">
                  <div className="topbar-profile-avatar large">
                    <span>{(displayName || "U").charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="popover-user-name">{user?.name || "User"}</div>
                    {user?.email && <div className="popover-user-meta">{user.email}</div>}
                    {user?.role && (
                      <span className={`topbar-profile-role ${user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? 'admin' : 'agent'}`}>
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button type="button" className="popover-item" onClick={handleOpenSettings}>
                ⚙ Profile & Settings
              </button>
              <button type="button" className="popover-item logout" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopBar;
