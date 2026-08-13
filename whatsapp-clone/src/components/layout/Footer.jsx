import { Link } from "react-router-dom";
import "../../styles/Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h2>
              WATI <span>Clone</span>
            </h2>
          </Link>
          <p>Build Better Customer Conversations.</p>
        </div>

        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/chats">Chats</Link>
          <Link to="/contacts">Contacts</Link>
        </div>

        <div className="footer-copy">
          © 2026 WATI Clone. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;