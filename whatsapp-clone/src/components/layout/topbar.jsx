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

    const displayName = user?.name || user?.email || "User";

    async function handleLogout() {
        await logout();
        navigate("/login", { replace: true });
    }

    return (
        <header className="topbar">
            <div className="topbar-left">
                <h2>Dashboard</h2>
                <p>Welcome back, {displayName} 👋</p>
            </div>

            <div className="topbar-right">
                <button className="create-btn" type="button">
                    + New Chat
                </button>

                <button className="create-btn" type="button" onClick={handleLogout}>
                    Logout
                </button>

                <div className="topbar-icon">
                    <FaQuestionCircle />
                </div>

                <div className="topbar-icon">
                    <FaBell />
                </div>

                <div className="topbar-icon">
                    <FaCog />
                </div>

                <div className="profile">
                    <FaUserCircle />
                    <span>{displayName}</span>
                </div>
            </div>
        </header>
    );
}

export default TopBar;