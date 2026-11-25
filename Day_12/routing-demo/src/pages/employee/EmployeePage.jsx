import { useEffect, useState } from "react";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
} from "react-bootstrap";

import { useNavigate } from "react-router";

import {
  getEmployees,
} from "../../services/employeeService";

function EmployeePage() {
  const navigate = useNavigate();

  const [employees,
    setEmployees] =
    useState([]);

  const [search,
    setSearch] =
    useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees =
    async () => {
      try {
        const data =
          await getEmployees();

        setEmployees(data);
      } catch (error) {
        console.log(error);
      }
    };

  const totalDepartments =
    [
      ...new Set(
        employees.map(
          (employee) =>
            employee.department
        )
      ),
    ].length;

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

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Employees 👨‍💼
          </h2>

          <p className="text mb-2">
            Manage employee records,
            departments and workforce.
          </p>

        </div>

        <div className="d-flex gap-2">

          <Button
            variant="outline-primary"
            className="app-btn"
            onClick={() =>
              navigate(
                "/employees/list"
              )
            }
          >
            View Employees
          </Button>

          <Button
            variant="primary"
            className="app-btn"
            onClick={() =>
              navigate(
                "/employees/add"
              )
            }
          >
            + Add Employee
          </Button>

        </div>

      </div>

      {/* Search */}

      <Row className="mb-4">

        <Col>

          <Card className="glass-card border-0">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                <div>

                  <h5 className="fw-bold mb-1">
                    Workforce Overview
                  </h5>

                  <p className="text-muted mb-0">
                    Monitor employees,
                    departments and workforce performance.
                  </p>

                </div>

                <div className="d-flex gap-2">
                  <Button
                    variant="outline-success"
                    onClick={() =>
                      navigate("/reports")
                    }
                  >
                    Reports
                  </Button>

                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>

      </Row>

      {/* Stats Cards */}

      <Row className="g-4 mb-4">

        <Col md={4}>

          <Card className="glass-card border-0 h-100">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small className="text-muted">
                    Employees
                  </small>

                  <h2 className="fw-bold text-primary">
                    {employees.length}
                  </h2>

                </div>

                <i className="bi bi-people-fill fs-1 text-primary"></i>

              </div>

            </Card.Body>

          </Card>

        </Col>

        <Col md={4}>

          <Card className="glass-card border-0 h-100">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small className="text-muted">
                    Departments
                  </small>

                  <h2 className="fw-bold text-success">
                    {totalDepartments}
                  </h2>

                </div>

                <i className="bi bi-diagram-3-fill fs-1 text-success"></i>

              </div>

            </Card.Body>

          </Card>

        </Col>

        <Col md={4}>

          <Card className="glass-card border-0 h-100">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small className="text-muted">
                    Availability
                  </small>

                  <h2 className="fw-bold text-warning">
                    100%
                  </h2>

                </div>

                <i className="bi bi-activity fs-1 text-warning"></i>

              </div>

            </Card.Body>

          </Card>

        </Col>

      </Row>

      {/* Quick Actions */}

      <h4 className="fw-bold mb-3">
        Quick Actions
      </h4>

      <Row className="g-4">

        <Col md={6}>

          <Card className="glass-card border-0 h-100">

            <Card.Body>

              <div className="d-flex align-items-center gap-3 mb-3">

                <i className="bi bi-person-lines-fill fs-1 text-primary"></i>

                <div>

                  <h5 className="fw-bold mb-1">
                    Employee Directory
                  </h5>

                  <p className="text-muted mb-0">
                    View employee records,
                    details and management information.
                  </p>

                </div>

              </div>

              <Button
                variant="primary"
                className="app-btn"
                onClick={() =>
                  navigate(
                    "/employees/list"
                  )
                }
              >
                Open Directory
              </Button>

            </Card.Body>

          </Card>

        </Col>

        <Col md={6}>

          <Card className="glass-card border-0 h-100">

            <Card.Body>

              <div className="d-flex align-items-center gap-3 mb-3">

                <i className="bi bi-person-plus-fill fs-1 text-success"></i>

                <div>

                  <h5 className="fw-bold mb-1">
                    Create Employee
                  </h5>

                  <p className="text-muted mb-0">
                    Register a new employee
                    with department and salary information.
                  </p>

                </div>

              </div>

              <Button
                variant="success"
                className="app-btn"
                onClick={() =>
                  navigate(
                    "/employees/add"
                  )
                }
              >
                Add Employee
              </Button>

            </Card.Body>

          </Card>

        </Col>

      </Row>

      {/* Summary */}

      <Row className="mt-4">

        <Col>

          <Card className="glass-card border-0">

            <Card.Body>

              <h5 className="fw-bold">
                Employee Summary
              </h5>

              <p className="text-muted mb-0">
                You currently manage{" "}
                <strong>
                  {employees.length}
                </strong>{" "}
                employees across{" "}
                <strong>
                  {totalDepartments}
                </strong>{" "}
                departments.
              </p>

            </Card.Body>

          </Card>

        </Col>

      </Row>

    </Container>
  );
}

export default EmployeePage;