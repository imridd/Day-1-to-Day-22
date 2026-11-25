import { useEffect, useState } from "react";

import {
  useParams,
  useNavigate,
} from "react-router";

import {
  Formik,
  Form,
  Field,
  ErrorMessage,
} from "formik";

import * as Yup from "yup";

import {
  Card,
  Button,
  Container,
  Row,
  Col,
  Spinner,
  Badge,
  InputGroup,
} from "react-bootstrap";

import {
  getEmployeeById,
  updateEmployee,
} from "../../services/employeeService";

import AppNotification from "../../components/common/AppNotification";

const EmployeeSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Employee Name is required")
    .min(
      3,
      "Minimum 3 characters required"
    )
    .max(
      50,
      "Maximum 50 characters allowed"
    )
    .matches(
      /^[A-Za-z ]+$/,
      "Only alphabets and spaces allowed"
    ),

  email: Yup.string()
    .trim()
    .required("Email is required")
    .email(
      "Enter a valid email address"
    ),

  department: Yup.string()
    .required(
      "Department is required"
    ),

  salary: Yup.number()
    .typeError(
      "Salary must be numeric"
    )
    .required(
      "Salary is required"
    )
    .positive(
      "Salary must be greater than 0"
    )
    .min(
      10000,
      "Minimum salary is ₹10,000"
    )
    .max(
      1000000,
      "Maximum salary is ₹10,00,000"
    ),
});

function EditEmployee() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [employee,
    setEmployee] =
    useState(null);

  const [loading,
    setLoading] =
    useState(true);

  const [message,
    setMessage] =
    useState("");

  const [variant,
    setVariant] =
    useState("");

  useEffect(() => {
    loadEmployee();
  }, []);

  const loadEmployee =
    async () => {
      try {

        setLoading(true);

        const data =
          await getEmployeeById(id);

        setEmployee(data);

      } catch (error) {

        console.error(error);

        setVariant("danger");

        setMessage(
          "Failed to load employee ❌"
        );

      } finally {

        setLoading(false);

      }
    };

  const handleUpdate =
    async (values) => {

      try {

        await updateEmployee(
          id,
          values
        );

        setEmployee(values);

        setVariant("success");

        setMessage(
          "Employee updated successfully ✅"
        );

      } catch (error) {

        console.error(error);

        setVariant("danger");

        setMessage(
          "Failed to update employee ❌"
        );

      }
    };

  if (loading) {
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
            View and update workforce information.
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

      <AppNotification
        message={message}
        variant={variant}
        setMessage={setMessage}
      />

      {/* Summary Card */}

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

      {/* Overview */}

      <Row className="g-3 mb-4">

        <Col md={4}>

          <Card className="glass-card border-0">

            <Card.Body>

              <small className="text-muted">
                Department
              </small>

              <h5 className="fw-bold">
                {employee.department}
              </h5>

            </Card.Body>

          </Card>

        </Col>

        <Col md={4}>

          <Card className="glass-card border-0">

            <Card.Body>

              <small className="text-muted">
                Salary
              </small>

              <h5 className="fw-bold text-success">
                ₹
                {Number(
                  employee.salary
                ).toLocaleString()}
              </h5>

            </Card.Body>

          </Card>

        </Col>

        <Col md={4}>

          <Card className="glass-card border-0">

            <Card.Body>

              <small className="text-muted">
                Email
              </small>

              <h6 className="fw-bold">
                {employee.email}
              </h6>

            </Card.Body>

          </Card>

        </Col>

      </Row>

      <Formik
        enableReinitialize
        initialValues={{
          name:
            employee?.name || "",

          email:
            employee?.email || "",

          department:
            employee?.department || "",

          salary:
            employee?.salary || "",
        }}
        validationSchema={
          EmployeeSchema
        }
        onSubmit={
          handleUpdate
        }
      >
        {({
          touched,
          errors,
          resetForm,
        }) => (
          <Form>

            <Card className="glass-card border-0">

              <Card.Header className="bg-transparent border-0">

                <h4 className="fw-bold mb-0">
                  Edit Employee
                </h4>

              </Card.Header>

              <Card.Body>

                <Row>

                  <Col md={6}>

                    <div className="mb-3">

                      <label className="form-label fw-semibold">
                        Employee Name
                      </label>

                      <Field
                        name="name"
                        className={`form-control ${
                          touched.name &&
                          errors.name
                            ? "is-invalid"
                            : ""
                        }`}
                      />

                      <ErrorMessage
                        name="name"
                        component="div"
                        className="invalid-feedback"
                      />

                    </div>

                  </Col>

                  <Col md={6}>

                    <div className="mb-3">

                      <label className="form-label fw-semibold">
                        Email
                      </label>

                      <Field
                        type="email"
                        name="email"
                        className={`form-control ${
                          touched.email &&
                          errors.email
                            ? "is-invalid"
                            : ""
                        }`}
                      />

                      <ErrorMessage
                        name="email"
                        component="div"
                        className="invalid-feedback"
                      />

                    </div>

                  </Col>

                </Row>

                <Row>

                  <Col md={6}>

                    <div className="mb-3">

                      <label className="form-label fw-semibold">
                        Department
                      </label>

                      <Field
                        as="select"
                        name="department"
                        className={`form-select ${
                          touched.department &&
                          errors.department
                            ? "is-invalid"
                            : ""
                        }`}
                      >
                        <option value="">
                          Select Department
                        </option>

                        <option value="IT">
                          IT
                        </option>

                        <option value="HR">
                          HR
                        </option>

                        <option value="Finance">
                          Finance
                        </option>

                        <option value="Marketing">
                          Marketing
                        </option>

                        <option value="Sales">
                          Sales
                        </option>

                        <option value="Admin">
                          Admin
                        </option>

                        <option value="Operations">
                          Operations
                        </option>

                      </Field>

                      <ErrorMessage
                        name="department"
                        component="div"
                        className="invalid-feedback"
                      />

                    </div>

                  </Col>

                  <Col md={6}>

                    <div className="mb-3">

                      <label className="form-label fw-semibold">
                        Salary
                      </label>

                      <InputGroup>

                        <InputGroup.Text>
                          ₹
                        </InputGroup.Text>

                        <Field
                          type="number"
                          name="salary"
                          className={`form-control ${
                            touched.salary &&
                            errors.salary
                              ? "is-invalid"
                              : ""
                          }`}
                        />

                      </InputGroup>

                      <ErrorMessage
                        name="salary"
                        component="div"
                        className="text-danger mt-1"
                      />

                    </div>

                  </Col>

                </Row>

              </Card.Body>

              <Card.Footer className="bg-transparent border-0">

                <div className="d-flex justify-content-end gap-2">

                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() =>
                      resetForm()
                    }
                  >
                    Reset
                  </Button>

                  <Button
                    type="button"
                    variant="outline-danger"
                    onClick={() =>
                      navigate(
                        `/employees/view/${id}`
                      )
                    }
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    className="app-btn"
                  >
                    Save Changes
                  </Button>

                </div>

              </Card.Footer>

            </Card>

          </Form>
        )}
      </Formik>

    </Container>
  );
}

export default EditEmployee;