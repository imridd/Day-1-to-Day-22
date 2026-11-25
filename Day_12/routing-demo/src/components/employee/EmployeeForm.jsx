import {
  Formik,
  Form,
  Field,
  ErrorMessage,
} from "formik";

import * as Yup from "yup";
import {
  useEffect,
  useState,
} from "react";

import useAuth
  from "../../hooks/useAuth";

import {
  getDepartments,
  addDepartment,
} from "../../services/departmentService";
import {
  Card,
  Row,
  Col,
  Button,
  InputGroup,
} from "react-bootstrap";

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
      "Only alphabets are allowed"
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
    )
    .oneOf(
      [
        "IT",
        "HR",
        "Finance",
        "Marketing",
        "Sales",
        "Admin",
        "Operations",
      ],
      "Please select a valid department"
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
      1000,
      "Minimum salary is ₹1000"
    )
    .max(
      1000000,
      "Maximum salary is ₹10,00,000"
    ),
});

function EmployeeForm({ onSave }) {
  const { role } =
    useAuth();

  const [
    departments,
    setDepartments,
  ] = useState([]);
  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments =
    async () => {

      try {

        const data =
          await getDepartments();

        setDepartments(data);

      } catch (error) {

        console.log(error);

      }
    };
  return (
    <Formik
      initialValues={{
        name: "",
        email: "",
        department: "",
        salary: "",
      }}
      validationSchema={
        EmployeeSchema
      }
      onSubmit={(
        values,
        { resetForm }
      ) => {

        onSave(values);

        resetForm();
      }}
    >
      {({
        touched,
        errors,
        resetForm,
        setFieldValue,
      }) => (
        <Form>

          {/* Employee Info */}

          <Card className="glass-card border-0 mb-4">

            <Card.Header className="bg-transparent border-0">

              <h5 className="fw-bold mb-0">
                Employee Information
              </h5>

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
                      placeholder="Enter Employee Name"
                      className={`form-control ${touched.name &&
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
                      Email Address
                    </label>

                    <Field
                      type="email"
                      name="email"
                      placeholder="Enter Email"
                      className={`form-control ${touched.email &&
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

            </Card.Body>

          </Card>

          {/* Department & Salary */}

          <Card className="glass-card border-0 mb-4">

            <Card.Header className="bg-transparent border-0">

              <h5 className="fw-bold mb-0">
                Employment Details
              </h5>

            </Card.Header>

            <Card.Body>

              <Row>

                <Col md={6}>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Department
                    </label>

                    <Field
                      as="select"
                      name="department"
                      className={`form-select ${touched.department &&
                        errors.department
                        ? "is-invalid"
                        : ""
                        }`}
                    >

                      <option value="">
                        Select Department
                      </option>

                      {departments.map(
                        (department) => (

                          <option
                            key={department.id}
                            value={department.name}
                          >
                            {department.name}
                          </option>

                        )
                      )}

                    </Field>
                    {role === "admin" && (

                      <Button
                        type="button"
                        variant="link"
                        className="
    p-0
    text-decoration-none
    fw-semibold
    "
                        onClick={async () => {

                          const departmentName =
                            prompt(
                              "Enter Department Name"
                            );

                          if (
                            !departmentName ||
                            !departmentName.trim()
                          ) {
                            return;
                          }

                          try {

                            await addDepartment(
                              departmentName.trim()
                            );

                            await loadDepartments();

                            setFieldValue(
                              "department",
                              departmentName.trim()
                            );

                          } catch (error) {

                            console.log(error);

                          }

                        }}
                      >
                        ➕ Add Department
                      </Button>

                    )}
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
                        placeholder="Enter Salary"
                        className={`form-control ${touched.salary &&
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

          </Card>

          {/* Actions */}

          <Card className="glass-card border-0">

            <Card.Body>

              <div className="d-flex justify-content-end gap-2">

                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => {

                    const confirmReset =
                      window.confirm(
                        "Clear all fields?"
                      );

                    if (
                      confirmReset
                    ) {
                      resetForm();
                    }

                  }}
                >
                  Reset
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  className="app-btn"
                >
                  Save Employee
                </Button>

              </div>

            </Card.Body>

          </Card>

        </Form>
      )}
    </Formik>
  );
}

export default EmployeeForm;