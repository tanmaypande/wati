import "../../styles/Footer.css";

function Footer() {
return (
    <footer className="footer">
    <div className="footer-container">
        <div className="footer-logo">
        <h2>
            WATI <span>Clone</span>
            </h2>
        <p>Build Better Customer Conversations.</p>
        </div>

        <div className="footer-links">
        <a href="#">Home</a>
        <a href="/dashboard">Dashboard</a>
        <a href="#">Pricing</a>
        <a href="/setting">Support</a>
        </div>

        <div className="footer-copy">
        © 2026 WATI Clone. All Rights Reserved.
        </div>
    </div>
    </footer>
);
}

export default Footer;