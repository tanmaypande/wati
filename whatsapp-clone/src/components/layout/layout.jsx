import { useState } from "react";
import TopBar from "./topbar";
import Sidebar from "./sidebar";
import Footer from "./Footer";
import "../../styles/layout.css";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="layout">
      {/* Top Navigation */}
      <TopBar onToggleSidebar={() => setSidebarOpen((s) => !s)} />

      {/* Sidebar + Main Content */}
      <div className="main">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="content" onClick={() => { if (sidebarOpen) setSidebarOpen(false); }}>
          {children}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Layout;