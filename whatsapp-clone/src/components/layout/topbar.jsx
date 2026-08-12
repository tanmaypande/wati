import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "../../styles/TopBar.css";
import {
  FaBell,
  FaCog,
  FaQuestionCircle,
  FaUserCircle,
} from "react-icons/fa";

function TopBar() {
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
      <div className="topbar-left">
        <h2>Dashboard</h2>
        <p>Welcome back, {displayName} 👋</p>
      </div>

      <div className="topbar-right">
        <button className="create-btn" type="button" onClick={handleNewChat}>
          + New Chat
        </button>

        <button className="create-btn" type="button" onClick={handleLogout}>
          Logout
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
            className={`topbar-icon profile ${activePopover === "profile" ? "active" : ""}`}
            onClick={() => togglePopover("profile")}
            aria-label="Profile menu"
          >
            <FaUserCircle />
          </button>
          {activePopover === "profile" && (
            <div className="topbar-popover topbar-popover--right topbar-popover--profile">
              <div className="popover-user">
                <div className="popover-user-name">{user?.name || "User"}</div>
                {user?.email && <div className="popover-user-meta">{user.email}</div>}
                {user?.role && <div className="popover-user-meta">Role: {user.role}</div>}
              </div>
              <button type="button" className="popover-item" onClick={handleOpenSettings}>
                Profile / Settings
              </button>
              <button type="button" className="popover-item" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopBar;
