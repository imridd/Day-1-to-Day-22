
import { Outlet } from "react-router";
import RoleNavbar from "../components/common/RoleNavbar";

function MainLayout() {
  return (
    <>
      <RoleNavbar />

      <div className="min-vh-100 p-3">
        <Outlet />
      </div>
    </>
  );
}

export default MainLayout;
