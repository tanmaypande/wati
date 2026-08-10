import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/dashboard";
import Chats from "../pages/chats";
import Contacts from "../pages/Contacts";
import Login from "../pages/Login";
import Register from "../pages/Register";
import PrivateRoute from "../components/PrivateRoute";
import Broadcast from "../pages/Broadcast";
import Template from "../pages/Template";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

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
    </Routes>
    
  );
}
export default AppRoutes;