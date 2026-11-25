import {Navigate} from "react-router";
import useAuth from "../hooks/useAuth";
function ProtectedRoute({children,allowedRoles}) {
  const {isAuthenticated,role} = useAuth();
  if (!isAuthenticated) return (<Navigate to="/" replace/>);
  if (!allowedRoles.includes(role)) return (<Navigate to="/" replace/>);
  return children;
}
export default ProtectedRoute;
