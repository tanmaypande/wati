import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Chats from "../pages/chats";
import Contacts from "../pages/Contacts";
import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyEmail from "../pages/VerifyEmail";
import Landing from "../pages/Landing";
import PrivateRoute from "../components/PrivateRoute";
import Broadcast from "../pages/Broadcast";
import Template from "../pages/Template";
import Analytics from "../pages/Analytics";
import Settings from "../pages/Settings";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/chats" element={<PrivateRoute><Chats /></PrivateRoute>} />
      <Route path="/contacts" element={<PrivateRoute><Contacts /></PrivateRoute>} />
      <Route
        path="/broadcast"
        element={
          <PrivateRoute>
            <Broadcast />
          </PrivateRoute>
        }
      />
      <Route
        path="/templates"
        element={
          <PrivateRoute>
            <Template />
          </PrivateRoute>
        }
      />
      <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />

      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
    </Routes>
    
  );
}
export default AppRoutes;