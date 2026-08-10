import { NavLink } from "react-router-dom";
import { FiBarChart2, FiGrid, FiMessageSquare, FiSend, FiSettings, FiUsers, FiFileText } from "react-icons/fi";
import "../../styles/Sidebar.css";

const menuItems = [
  { to: "/dashboard", label: "Dashboard", icon: <FiGrid /> },
  { to: "/chats", label: "Chats", icon: <FiMessageSquare /> },
  { to: "/contacts", label: "Contacts", icon: <FiUsers /> },
  { to: "/broadcast", label: "Broadcast", icon: <FiSend /> },
  { to: "/templates", label: "Templates", icon: <FiFileText /> },
  { to: "/analytics", label: "Analytics", icon: <FiBarChart2 /> },
  { to: "/settings", label: "Settings", icon: <FiSettings /> },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>
          WATI<span>Clone</span>
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
    </aside>
  );
}

export default Sidebar;