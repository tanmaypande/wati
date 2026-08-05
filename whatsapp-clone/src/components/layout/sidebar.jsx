import { NavLink } from "react-router-dom";
import "../../styles/Sidebar.css";

function Sidebar() {
return (
    <aside className="sidebar">
    <div className="sidebar-logo">
        <h2>
        WATI<span>Clone</span>
        </h2>
    </div>

    <div className="sidebar-menu">
        <NavLink
        to="/dashboard"
        className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
        }
        >
        Dashboard
        </NavLink>

        <NavLink
        to="/chats"
        className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
        }
        >
        Chats
        </NavLink>

        <NavLink
        to="/contacts"
        className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
        }
        >
        Contacts
        </NavLink>

        <NavLink
        to="/broadcast"
        className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
        }
        >
        Broadcast
        </NavLink>

        <NavLink
        to="/templates"
        className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
        }
        >
        Templates
        </NavLink>

        <NavLink
        to="/analytics"
        className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
        }
        >
        Analytics
        </NavLink>

        <NavLink
        to="/settings"
        className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
        }
        >
        Settings
        </NavLink>
    </div>
    </aside>
);
}

export default Sidebar;