import './App.css';
import { BrowserRouter, useLocation } from "react-router-dom";
import Layout from "./components/layout/layout";
import AppRoutes from "./routes/AppRoutes";

function AppContent() {
  const location = useLocation();
  const path = location.pathname;

  // Super Admin routes and auth/landing routes do NOT use the employee workspace Layout
  const isSuperAdmin = path.startsWith('/super-admin');
  const hideEmployeeLayout = ['/login', '/register', '/verify-email', '/workspace-suspended', '/'].includes(path) || isSuperAdmin;

  if (hideEmployeeLayout) {
    return <AppRoutes />;
  }

  return (
    <Layout>
      <AppRoutes />
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
