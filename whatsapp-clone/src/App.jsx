import './App.css'
import { BrowserRouter, useLocation } from "react-router-dom";
import Layout from "./components/layout/Layout";
import AppRoutes from "./routes/AppRoutes";
import "./styles/Layout.css";

function AppContent() {
  const location = useLocation();
  const hideLayout = location.pathname === '/login';

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
