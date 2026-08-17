import { NavLink, useNavigate } from "react-router-dom";
import { FiBarChart2, FiGrid, FiMessageSquare, FiSend, FiSettings, FiUsers, FiFileText, FiShield, FiLogOut } from "react-icons/fi";
import { useAuth } from "../../context/useAuth";
import "../../styles/sidebar.css";

function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (onClose) onClose();
    await logout();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { to: "/dashboard", label: "Dashboard", icon: <FiGrid /> },
    { to: "/chats", label: "Chats", icon: <FiMessageSquare /> },
    { to: "/contacts", label: "Contacts", icon: <FiUsers /> },
    ...(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? [{ to: "/agents", label: "Team Employees", icon: <FiShield /> }] : []),
    { to: "/broadcast", label: "Broadcast", icon: <FiSend /> },
    { to: "/templates", label: "Templates", icon: <FiFileText /> },
    { to: "/analytics", label: "Analytics", icon: <FiBarChart2 /> },
    { to: "/settings", label: "Settings", icon: <FiSettings /> },
  ];

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`} onClick={() => { if (onClose) onClose(); }}>
      <div className="sidebar-logo">
        <img src="/logo.png" alt="ConvoNest Logo" style={{ height: '36px', width: 'auto', marginRight: '10px' }} />
        <h2>
          Convo<span>Nest</span>
        </h2>
      </div>

      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
          >
            <span className="menu-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-bottom">
        <button type="button" className="sidebar-logout-btn" onClick={handleLogout}>
          <span className="menu-icon"><FiLogOut /></span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;