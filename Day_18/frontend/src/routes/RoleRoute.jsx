
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/reduxHooks";
import AppLoader from "../components/common/AppLoader";

function normalizeRole(role) {
  const value = String(role || "")
    .trim()
    .toLowerCase();

  if (value === "manager" || value === "admin") {
    return "Manager";
  }

  if (value === "agent") {
    return "Agent";
  }

  if (value === "customer" || value === "user") {
    return "Customer";
  }

  return null;
}

export default function RoleRoute({ allowedRoles = [] }) {
  const { user, loading } = useAppSelector(
    (state) => state.auth
  );

  if (loading) {
    return <AppLoader message="Checking permissions..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = normalizeRole(
    user.role || user.userRole || user.user_type
  );

  const permittedRoles = allowedRoles.map(normalizeRole);

  if (!userRole || !permittedRoles.includes(userRole)) {
    if (userRole === "Manager") {
      return <Navigate to="/manager/dashboard" replace />;
    }

    if (userRole === "Agent") {
      return <Navigate to="/agent/dashboard" replace />;
    }

    if (userRole === "Customer") {
      return <Navigate to="/customer/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
