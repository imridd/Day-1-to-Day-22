import { useEffect, useState } from "react";

import {
  useParams,
  useNavigate,
} from "react-router";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Badge,
} from "react-bootstrap";

import {
  getEmployeeById,
} from "../../services/employeeService";

function EmployeeDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [employee, setEmployee] =
    useState(null);

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    try {
      const data =
        await getEmployeeById(id);

      setEmployee(data);
    } catch (error) {
      console.log(error);
    }
  };

  if (!employee) {
    return (
      <Container>
        <div className="text-center py-5">

          <Spinner
            animation="border"
            variant="primary"
          />

          <h5 className="mt-3">
            Loading Employee Details...
          </h5>

          <p className="text-muted">
            Retrieving employee information.
          </p>

        </div>
      </Container>
    );
  }

  return (
    <Container
      fluid
      className="py-4 px-4 fade-up"
    >
      {/* Header */}

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Employee Details 👨‍💼
          </h2>

          <p className="text-muted mb-0">
            View workforce information
            and employee profile.
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

          <Button
            variant="primary"
            onClick={() =>
              navigate("/employees/list")
            }
          >
            Employee List
          </Button>

        </div>

      </div>

      {/* Employee Summary */}

      <Card className="glass-card border-0 mb-4">

        <Card.Body>

          <div className="d-flex justify-content-between align-items-center flex-wrap">

            <div>

              <h3 className="fw-bold mb-1">
                {employee.name}
              </h3>

              <p className="text-muted mb-0">
                Employee ID: #{employee.id}
              </p>

            </div>

            <Badge
              bg="primary"
              className="fs-6"
            >
              {employee.department}
            </Badge>

          </div>

        </Card.Body>

      </Card>

      {/* Information Cards */}

      <Row className="g-4 mb-4">

        <Col md={6}>

          <Card className="glass-card border-0 h-100">

            <Card.Body>

              <small className="text-muted">
                Email Address
              </small>

              <h5 className="fw-bold mt-2">
                {employee.email}
              </h5>

            </Card.Body>

          </Card>

        </Col>

        <Col md={6}>

          <Card className="glass-card border-0 h-100">

            <Card.Body>

              <small className="text-muted">
                Department
              </small>

              <h5 className="fw-bold mt-2">
                {employee.department}
              </h5>

            </Card.Body>

          </Card>

        </Col>

      </Row>

      <Row className="g-4 mb-4">

        <Col md={6}>

          <Card className="glass-card border-0 h-100">

            <Card.Body>

              <small className="text-muted">
                Salary
              </small>

              <h4 className="fw-bold text-success mt-2">
                ₹
                {Number(
                  employee.salary
                ).toLocaleString()}
              </h4>

            </Card.Body>

          </Card>

        </Col>

        <Col md={6}>

          <Card className="glass-card border-0 h-100">

            <Card.Body>

              <small className="text-muted">
                Employee Status
              </small>

              <h5 className="fw-bold mt-2">
                Active
              </h5>

            </Card.Body>

          </Card>

        </Col>

      </Row>

      {/* Actions */}

      <Card className="glass-card border-0">

        <Card.Body>

          <div className="d-flex flex-wrap gap-2">

            <Button
              variant="outline-secondary"
              onClick={() =>
                navigate("/employees/list")
              }
            >
              Back To List
            </Button>

            <Button
              variant="warning"
              className="app-btn"
              onClick={() =>
                navigate(
                  `/employees/edit/${employee.id}`
                )
              }
            >
              Edit Employee
            </Button>

          </div>

        </Card.Body>

      </Card>

    </Container>
  );
}

export default EmployeeDetails;