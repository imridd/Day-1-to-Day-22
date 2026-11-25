
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks/reduxHooks";
import AppLoader from "../components/common/AppLoader";

export default function ProtectedRoute() {
  const location = useLocation();

  const { token, loading } = useAppSelector(
    (state) => state.auth
  );

  if (loading) {
    return <AppLoader message="Checking your session..." />;
  }

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}
