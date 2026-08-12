import TopBar from "./topbar";
import Sidebar from "./sidebar";
import Footer from "./Footer";
import "../../styles/layout.css";

function Layout({ children }) {
return (
    <div className="layout">
      {/* Top Navigation */}
    <TopBar />

      {/* Sidebar + Main Content */}
    <div className="main">
        <Sidebar />

        <main className="content">
        {children}
        </main>
    </div>

    {/* Footer */}
    <Footer />
    </div>
);
}

export default Layout;