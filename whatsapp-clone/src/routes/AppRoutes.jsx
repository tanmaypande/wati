import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "../pages/dashboard";
import Chats from "../pages/chats";
import Contacts from "../pages/Contacts";
import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyEmail from "../pages/VerifyEmail";
import Landing from "../pages/Landing";
import PrivateRoute from "../components/PrivateRoute";
import SuperAdminRoute from "../components/SuperAdminRoute";
import Broadcast from "../pages/Broadcast";
import Template from "../pages/Template";
import Analytics from "../pages/Analytics";
import Settings from "../pages/Settings";
import Agents from "../pages/Agents";

import SuperAdminDashboard from "../pages/SuperAdminDashboard";
import SuperAdminCompanies from "../pages/SuperAdminCompanies";
import SuperAdminCompanyDetail from "../pages/SuperAdminCompanyDetail";
import SuperAdminUsers from "../pages/SuperAdminUsers";
import SuperAdminAuditLogs from "../pages/SuperAdminAuditLogs";
import SuperAdminSettings from "../pages/SuperAdminSettings";
import SuspendedWorkspace from "../pages/SuspendedWorkspace";
import { useAuth } from "../context/useAuth";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/workspace-suspended" element={<SuspendedWorkspace />} />

      {/* Tenant Workspace Routes */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/chats" element={<PrivateRoute><Chats /></PrivateRoute>} />
      <Route path="/contacts" element={<PrivateRoute><Contacts /></PrivateRoute>} />
      <Route path="/agents" element={<PrivateRoute><Agents /></PrivateRoute>} />
      <Route path="/broadcast" element={<PrivateRoute><Broadcast /></PrivateRoute>} />
      <Route path="/templates" element={<PrivateRoute><Template /></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;