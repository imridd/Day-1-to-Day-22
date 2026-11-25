import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/dashboard/Dashboard";
import EmployeePage from "../pages/employee/EmployeePage";
import ProductPage from "../pages/product/ProductPage";
import CoursePage from "../pages/course/CoursePage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<MainLayout />}
        >
          <Route
            index
            element={<Dashboard />}
          />

          <Route
            path="employees"
            element={<EmployeePage />}
          />

          <Route
            path="products"
            element={<ProductPage />}
          />

          <Route
            path="courses"
            element={<CoursePage />}
          />
        </Route>
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </BrowserRouter>
  );
}

export default AppRoutes;