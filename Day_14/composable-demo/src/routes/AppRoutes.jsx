
import { Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import PageRenderer from "../composable/PageRenderer";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>

        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="/dashboard"
          element={<PageRenderer pageName="dashboard" />}
        />

        <Route
          path="/employees"
          element={<PageRenderer pageName="employees" />}
        />

        <Route
          path="/products"
          element={<PageRenderer pageName="products" />}
        />

        {/* Courses route */}
        <Route
          path="/courses"
          element={<PageRenderer pageName="courses" />}
        />

      </Route>

      {/* Invalid routes */}
      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}

export default AppRoutes;
