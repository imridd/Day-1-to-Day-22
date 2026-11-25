
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

// Layouts
import AuthLayout from "../layouts/AuthLayout";
import ManagerLayout from "../layouts/ManagerLayout";
import AgentLayout from "../layouts/AgentLayout";
import CustomerLayout from "../layouts/CustomerLayout";

// Authentication pages
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";

// Manager pages
import ManagerDashboard from "../pages/manager/ManagerDashboard";
import ManagerTicketsPage from "../pages/manager/ManagerTicketsPage";
import ManagerAgentsPage from "../pages/manager/ManagerAgentsPage";
import ManagerCustomersPage from "../pages/manager/ManagerCustomersPage";
import ManagerDepartmentsPage from "../pages/manager/ManagerDepartmentsPage";
import ManagerAnalyticsPage from "../pages/manager/ManagerAnalyticsPage";
import ManagerChatPage from "../pages/manager/ManagerChatPage";
import ManagerProfilePage from "../pages/manager/ManagerProfilePage";

// Agent pages
import AgentDashboard from "../pages/agent/AgentDashboard";
import AgentTicketsPage from "../pages/agent/AgentTicketsPage";
import AgentChatPage from "../pages/agent/AgentChatPage";

// Customer pages
import CustomerDashboard from "../pages/customer/CustomerDashboard";
import CustomerTicketsPage from "../pages/customer/CustomerTicketsPage";
import CustomerCreateTicketPage from "../pages/customer/CustomerCreateTicketsPage";
import CustomerTicketDetailsPage from "../pages/customer/CustomerDetailsPage";
import CustomerChatPage from "../pages/customer/customerChatPage";
import CustomerProfilePage from "../pages/customer/CustomerProfilePage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/forgot-password"
            element={<ForgotPasswordPage />}
          />
        </Route>

        {/* PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>

          {/* MANAGER */}
          <Route element={<RoleRoute allowedRoles={["Manager"]} />}>
            <Route path="/manager" element={<ManagerLayout />}>
              <Route
                index
                element={<Navigate to="dashboard" replace />}
              />

              <Route
                path="dashboard"
                element={<ManagerDashboard />}
              />

              <Route
                path="tickets"
                element={<ManagerTicketsPage />}
              />

              <Route
                path="agents"
                element={<ManagerAgentsPage />}
              />

              <Route
                path="customers"
                element={<ManagerCustomersPage />}
              />

              <Route
                path="departments"
                element={<ManagerDepartmentsPage />}
              />

              <Route
                path="analytics"
                element={<ManagerAnalyticsPage />}
              />

              <Route
                path="chat"
                element={<ManagerChatPage />}
              />

              <Route
                path="profile"
                element={<ManagerProfilePage />}
              />
            </Route>
          </Route>

          {/* AGENT */}
          <Route element={<RoleRoute allowedRoles={["Agent"]} />}>
            <Route path="/agent" element={<AgentLayout />}>
              <Route
                index
                element={<Navigate to="dashboard" replace />}
              />

              <Route
                path="dashboard"
                element={<AgentDashboard />}
              />

              <Route
                path="tickets"
                element={<AgentTicketsPage />}
              />

              <Route
                path="chat"
                element={<AgentChatPage />}
              />
            </Route>
          </Route>

          {/* CUSTOMER */}
          <Route element={<RoleRoute allowedRoles={["Customer"]} />}>
            <Route path="/customer" element={<CustomerLayout />}>
              <Route
                index
                element={<Navigate to="dashboard" replace />}
              />

              <Route
                path="dashboard"
                element={<CustomerDashboard />}
              />

              <Route
                path="tickets"
                element={<CustomerTicketsPage />}
              />

              <Route
                path="tickets/new"
                element={<CustomerCreateTicketPage />}
              />

              <Route
                path="tickets/:id"
                element={<CustomerTicketDetailsPage />}
              />

              <Route
                path="chat"
                element={<CustomerChatPage />}
              />

              <Route
                path="profile"
                element={<CustomerProfilePage />}
              />
            </Route>
          </Route>

        </Route>

        {/* DEFAULT ROUTES */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}
