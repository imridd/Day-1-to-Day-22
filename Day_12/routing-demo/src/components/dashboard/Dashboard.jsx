import { useEffect, useState } from "react";

import {
  Row,
  Col,
  Container,
  Alert,
  Spinner,
  Card,
  Button,
} from "react-bootstrap";

import { useNavigate } from "react-router";

import DashboardCard from "../../components/dashboard/DashboardCard";

import useAuth from "../../hooks/useAuth";

import { getUsers } from "../../services/userService";
import { getProducts } from "../../services/productService";
import { getEmployees } from "../../services/employeeService";

function Dashboard() {
  const navigate = useNavigate();

  const {
    role,
    currentUser,
  } = useAuth();

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [dashboardData,
    setDashboardData] =
    useState({
      users: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      products: 0,
      employees: 0,
    });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData =
    async () => {

      try {

        setLoading(true);

        setError("");

        const users =
          await getUsers();

        const products =
          await getProducts();

        const employees =
          await getEmployees();

        const activeUsers =
          users.filter(
            (user) =>
              user.status ===
              "active"
          );

        const inactiveUsers =
          users.filter(
            (user) =>
              user.status ===
              "inactive"
          );

        setDashboardData({
          users:
            users.length,

          activeUsers:
            activeUsers.length,

          inactiveUsers:
            inactiveUsers.length,

          products:
            products.length,

          employees:
            employees.length,
        });

      } catch (error) {

        console.error(error);

        setError(
          "Unable to load dashboard data."
        );

      } finally {

        setLoading(false);

      }
    };

  if (loading) {
    return (
      <Container
        fluid
        className="
        d-flex
        justify-content-center
        align-items-center
        min-vh-100
        "
      >
        <Spinner
          animation="border"
          variant="primary"
        />
      </Container>
    );
  }

  return (
    <Container
      fluid
      className="
      py-4
      px-4
      fade-up
      "
    >
      {/* Header */}

      <div className="mb-4">

        <h2 className="fw-bold">
          Welcome Back,
          {" "}
          {currentUser?.username}
          👋
        </h2>

        <p className="text mb-2">
          Access products,
          employees,
          reports,
          charts and user administration
          from one centralized dashboard.
        </p>

      </div>

      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      {/* Statistics */}

      <Row className="g-4">

        {role === "admin" && (
          <>
            <Col md={4}>
              <DashboardCard
                title="Total Users"
                count={
                  dashboardData.users
                }
                icon="bi bi-people-fill"
                bgColor="#eef7ff"
                onClick={() =>
                  navigate(
                    "/user-management"
                  )
                }
              />
            </Col>

            <Col md={4}>
              <DashboardCard
                title="Active Users"
                count={
                  dashboardData.activeUsers
                }
                icon="bi bi-person-check-fill"
                bgColor="#e9fff2"
              />
            </Col>

            <Col md={4}>
              <DashboardCard
                title="Inactive Users"
                count={
                  dashboardData.inactiveUsers
                }
                icon="bi bi-person-x-fill"
                bgColor="#fff1f1"
              />
            </Col>
          </>
        )}

        <Col md={6}>
          <DashboardCard
            title="Products"
            count={
              dashboardData.products
            }
            icon="bi bi-box-fill"
            bgColor="#f5f0ff"
            onClick={() =>
              navigate("/products")
            }
          />
        </Col>

        <Col md={6}>
          <DashboardCard
            title="Employees"
            count={
              dashboardData.employees
            }
            icon="bi bi-person-badge-fill"
            bgColor="#effcff"
            onClick={() =>
              navigate("/employees")
            }
          />
        </Col>

      </Row>

      {/* Quick Actions */}

      <div className="mt-5">

        <h4 className="fw-bold mb-4">
          Quick Actions
        </h4>

        <Row className="g-4">

          <Col md={4}>

            <Card
              className="
              glass-card
              quick-action-card
              border-0
              h-100
              "
              style={{
                cursor: "pointer",
              }}
              onClick={() =>
                navigate("/products")
              }
            >
              <Card.Body>

                <h5>
                  📦 Products
                </h5>

                <p className="text-muted">
                  Manage inventory,
                  product categories
                  and stock information.
                </p>

              </Card.Body>

            </Card>

          </Col>

          <Col md={4}>

            <Card
              className="
              glass-card
              quick-action-card
              border-0
              h-100
              "
              style={{
                cursor: "pointer",
              }}
              onClick={() =>
                navigate("/employees")
              }
            >
              <Card.Body>

                <h5>
                  👨‍💼 Employees
                </h5>

                <p className="text-muted">
                  Manage employees,
                  departments and workforce.
                </p>

              </Card.Body>

            </Card>

          </Col>

          <Col md={4}>

            <Card
              className="
              glass-card
              quick-action-card
              border-0
              h-100
              "
              style={{
                cursor: "pointer",
              }}
              onClick={() =>
                navigate("/reports")
              }
            >
              <Card.Body>

                <h5>
                  📊 Reports
                </h5>

                <p className="text-muted">
                  Generate reports,
                  summaries and insights.
                </p>

              </Card.Body>

            </Card>

          </Col>

        </Row>

      </div>

      {/* Recent Activity */}

      <div className="mt-5">

        <h4 className="fw-bold mb-4">
          Recent Activity
        </h4>

        <Card className="glass-card border-0">

          <Card.Body>

            <ul className="mb-0">

              <li>
                Product inventory available.
              </li>

              <li>
                Employee records loaded.
              </li>

              <li>
                Reports ready for review.
              </li>

              {role === "admin" && (
                <li>
                  User approval management available.
                </li>
              )}

            </ul>

          </Card.Body>

        </Card>

      </div>

      {/* System Overview */}

      <div className="mt-5">

        <h4 className="fw-bold mb-4">
          System Overview
        </h4>

        <Card className="glass-card border-0">

          <Card.Body>

            <Row>

              <Col md={4}>

                <h6 className="text-muted">
                  Products
                </h6>

                <h3 className="fw-bold text-primary">
                  {dashboardData.products}
                </h3>

              </Col>

              <Col md={4}>

                <h6 className="text-muted">
                  Employees
                </h6>

                <h3 className="fw-bold text-success">
                  {dashboardData.employees}
                </h3>

              </Col>

              {role === "admin" && (

                <Col md={4}>

                  <h6 className="text-muted">
                    Users
                  </h6>

                  <h3 className="fw-bold text-warning">
                    {dashboardData.users}
                  </h3>

                </Col>

              )}

            </Row>

          </Card.Body>

        </Card>

      </div>

    </Container>
  );
}

export default Dashboard;