
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";
import Loader from "../components/common/Loader";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../Layout/MainLayout";


// Auth Pages
const LoginPage = lazy(() =>
  import("../pages/auth/LoginPage")
);

const RegisterPage = lazy(() =>
  import("../pages/auth/RegisterPage")
);

// Dashboard
const Dashboard = lazy(() =>
  import("../components/dashboard/Dashboard")
);

// User Management
const UserManagement = lazy(() =>
  import("../pages/user/UserManagement")
);

// Charts
const ChartsPage = lazy(() =>
  import("../pages/charts/ChartsPage")
);

// Reports
const Reports = lazy(() =>
  import("../pages/reports/Reports")
);

// Product Pages
const ProductPage = lazy(() =>
  import("../pages/product/ProductPage")
);

const ProductList = lazy(() =>
  import("../pages/product/ProductList")
);

const AddProduct = lazy(() =>
  import("../pages/product/AddProduct")
);

const ViewProduct = lazy(() =>
  import("../pages/product/ViewProduct")
);

// Employee Pages
const EmployeePage = lazy(() =>
  import("../pages/employee/EmployeePage")
);

const EmployeeList = lazy(() =>
  import("../pages/employee/EmployeeList")
);

const AddEmployee = lazy(() =>
  import("../pages/employee/AddEmployee")
);

const EmployeeDetails = lazy(() =>
  import("../pages/employee/EmployeeDetails")
);

const EditEmployee = lazy(() =>
  import("../pages/employee/EditEmployee")
);

// Error Page
const NotFound = lazy(() =>
  import("../pages/error/NotFound")
);

function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>

        {/* Public Routes */}
        <Route
          path="/"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        {/* Protected Layout Routes */}
        <Route element={<MainLayout/>}>

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin", "user"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* User Management */}
          <Route
            path="/user-management"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          {/* Charts */}
          <Route
            path="/charts"
            element={
              <ProtectedRoute allowedRoles={["admin", "user"]}>
                <ChartsPage />
              </ProtectedRoute>
            }
          />

          {/* Reports */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={["admin", "user"]}>
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* Product Routes */}
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={["admin", "user"]}>
                <ProductPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/products/add"
            element={
              <ProtectedRoute allowedRoles={["admin", "user"]}>
                <AddProduct />
              </ProtectedRoute>
            }
          />

          <Route
            path="/products/list"
            element={
              <ProtectedRoute allowedRoles={["admin", "user"]}>
                <ProductList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/products/view/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "user"]}>
                <ViewProduct />
              </ProtectedRoute>
            }
          />

          {/* Employee Routes */}
          <Route
            path="/employees"
            element={
              <ProtectedRoute allowedRoles={["admin", "user"]}>
                <EmployeePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees/add"
            element={
              <ProtectedRoute allowedRoles={["admin", "user"]}>
                <AddEmployee />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees/list"
            element={
              <ProtectedRoute allowedRoles={["admin", "user"]}>
                <EmployeeList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees/view/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "user"]}>
                <EmployeeDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "user"]}>
                <EditEmployee />
              </ProtectedRoute>
            }
          />

        </Route>

        {/* 404 - Page Not Found */}
        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </Suspense>
  );
}

export default AppRoutes;

