import './App.css';
import { BrowserRouter, useLocation } from "react-router-dom";
import Layout from "./components/layout/layout";
import AppRoutes from "./routes/AppRoutes";

function AppContent() {
  const location = useLocation();
  const path = location.pathname;

  // Public/Auth routes do not use the workspace Layout
  const hideLayout = ['/login', '/register', '/verify-email', '/workspace-suspended', '/'].includes(path);

  if (hideLayout) {
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
