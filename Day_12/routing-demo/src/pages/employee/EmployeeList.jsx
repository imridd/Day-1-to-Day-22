
import { useEffect, useState } from "react";

import {
  Container,
  Button,
  Card,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";

import { useNavigate } from "react-router";

import EmployeeTable from "../../components/employee/EmployeeTable";

import AppNotification from "../../components/common/AppNotification";

import {
  getEmployees,
  deleteEmployee,
} from "../../services/employeeService";

function EmployeeList() {

  const navigate = useNavigate();

  const [employees, setEmployees] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [variant, setVariant] =
    useState("success");

  const loadEmployees =
    async () => {

      try {

        const data =
          await getEmployees();

        setEmployees(data);

      } catch (error) {

        console.log(error);

        setVariant("danger");

        setMessage(
          "Failed to load employee data ❌"
        );

      } finally {

        setLoading(false);

      }
    };

  const handleDelete =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Are you sure you want to delete this employee?"
        );

      if (!confirmDelete) return;

      try {

        await deleteEmployee(id);

        setEmployees(
          (prevEmployees) =>
            prevEmployees.filter(
              (employee) =>
                employee.id !== id
            )
        );

        setVariant("success");

        setMessage(
          "Employee deleted successfully ✅"
        );

      } catch (error) {

        console.log(error);

        setVariant("danger");

        setMessage(
          "Failed to delete employee ❌"
        );

      }
    };

  useEffect(() => {
    loadEmployees();
  }, []);

  if (loading) {
    return (
      <Container>
        <div className="text-center py-5">

          <Spinner
            animation="border"
            variant="primary"
          />

          <h5 className="mt-3">
            Loading Employees...
          </h5>

          <p className="text-muted">
            Fetching workforce data.
          </p>

        </div>
      </Container>
    );
  }

  const totalDepartments =
    [
      ...new Set(
        employees.map(
          (employee) =>
            employee.department
        )
      ),
    ].length;

  const averageSalary =
    employees.length > 0
      ? Math.round(
          employees.reduce(
            (total, employee) =>
              total +
              Number(
                employee.salary
              ),
            0
          ) / employees.length
        )
      : 0;

  return (
    <Container
      fluid
      className="py-4 px-4 fade-up"
    >
      {/* Header */}

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Employee Directory 👨‍💼
          </h2>

          <p className="text-muted mb-0">
            View and manage employee
            records and workforce information.
          </p>

        </div>

        <div className="d-flex gap-2">

          <Button
            variant="outline-secondary"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Dashboard
          </Button>

          <Button
            variant="outline-primary"
            onClick={() =>
              navigate("/employees")
            }
          >
            Employee Home
          </Button>

        </div>

      </div>

      {/* Notification */}

      <AppNotification
        message={message}
        variant={variant}
        setMessage={setMessage}
      />

      {/* Statistics */}

      <Row className="g-3 mb-4">

        <Col md={4}>

          <Card className="glass-card border-0 h-100">

            <Card.Body>

              <small className="text-muted">
                Employees
              </small>

              <h3 className="fw-bold text-primary">
                {employees.length}
              </h3>

            </Card.Body>

          </Card>

        </Col>

        <Col md={4}>

          <Card className="glass-card border-0 h-100">

            <Card.Body>

              <small className="text-muted">
                Departments
              </small>

              <h3 className="fw-bold text-success">
                {totalDepartments}
              </h3>

            </Card.Body>

          </Card>

        </Col>

        <Col md={4}>

          <Card className="glass-card border-0 h-100">

            <Card.Body>

              <small className="text-muted">
                Avg Salary
              </small>

              <h3 className="fw-bold text-warning">
                ₹
                {averageSalary.toLocaleString()}
              </h3>

            </Card.Body>

          </Card>

        </Col>

      </Row>

      {/* Employee Directory */}

      <Card className="glass-card border-0">

        <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center">

          <div>

            <h4 className="fw-bold mb-0">
              Employee Directory
            </h4>

            <small className="text-muted">
              Manage all employee records
            </small>

          </div>

          <Button
            variant="primary"
            className="app-btn"
            onClick={() =>
              navigate("/employees/add")
            }
          >
            + Add Employee
          </Button>

        </Card.Header>

        <Card.Body>

          <EmployeeTable
            employees={employees}
            onDelete={handleDelete}
          />

        </Card.Body>

      </Card>

    </Container>
  );
}

export default EmployeeList;
