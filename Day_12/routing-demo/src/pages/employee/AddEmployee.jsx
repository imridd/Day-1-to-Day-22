import { useState } from "react";

import {
  Container,
  Button,
  Card,
} from "react-bootstrap";

import { useNavigate } from "react-router";

import EmployeeForm from "../../components/employee/EmployeeForm";

import AppNotification from "../../components/common/AppNotification";

import {
  getEmployees,
  addEmployee,
} from "../../services/employeeService";

function AddEmployee() {
  const navigate = useNavigate();

  const [message, setMessage] =
    useState("");

  const [variant, setVariant] =
    useState("");

  const saveEmployee = async (
    employee
  ) => {
    try {
      const employees =
        await getEmployees();

      const newId =
        employees.length > 0
          ? Math.max(
              ...employees.map(
                (e) =>
                  Number(e.id)
              )
            ) + 1
          : 1;

      const newEmployee = {
        ...employee,
        id: newId,
      };

      await addEmployee(
        newEmployee
      );

      setVariant("success");

      setMessage(
        "Employee added successfully ✅"
      );
    } catch (error) {

      console.log(error);

      setVariant("danger");

      setMessage(
        "Failed to add employee ❌"
      );
    }
  };

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
            Create Employee 👨‍💼
          </h2>

          <p className="text-muted mb-0">
            Register new employees
            and manage workforce information.
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

      {/* Employee Guidelines */}

      <Card className="glass-card border-0 mb-4">

        <Card.Body>

          <h5 className="fw-bold mb-3">
            Employee Guidelines
          </h5>

          <ul className="mb-0 text-muted">

            <li>
              Employee ID will be
              generated automatically.
            </li>

            <li>
              Provide a valid email
              address.
            </li>

            <li>
              Select the correct
              department.
            </li>

            <li>
              Salary must be entered
              accurately.
            </li>

          </ul>

        </Card.Body>

      </Card>

      {/* Success Section */}

      {variant === "success" &&
        message && (

        <Card className="glass-card border-0 mb-4">

          <Card.Body className="d-flex justify-content-between align-items-center flex-wrap gap-3">

            <div>

              <h6 className="fw-bold text-success mb-1">
                Employee Added Successfully ✅
              </h6>

              <small className="text-muted">
                View the workforce directory
                to verify the employee record.
              </small>

            </div>

            <Button
              variant="success"
              onClick={() =>
                navigate(
                  "/employees/list"
                )
              }
            >
              View Employee List
            </Button>

          </Card.Body>

        </Card>
      )}

      {/* Employee Form */}

      <Card className="glass-card border-0">

        <Card.Header className="bg-transparent border-0">

          <h4 className="fw-bold mb-0">
            Employee Information
          </h4>

        </Card.Header>

        <Card.Body>

          <EmployeeForm
            onSave={saveEmployee}
          />

        </Card.Body>

      </Card>

    </Container>
  );
}

export default AddEmployee;