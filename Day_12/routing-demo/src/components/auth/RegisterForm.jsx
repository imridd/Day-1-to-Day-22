
import { useState } from "react";
import {
  Card,
  Button,
  Alert,
  Row,
  Col,
  Form as BootstrapForm,
} from "react-bootstrap";

import {
  Formik,
  Form,
  Field,
  ErrorMessage,
} from "formik";

import * as Yup from "yup";
import { Link } from "react-router";

import {
  registerUser,
  getUsers,
} from "../../services/userService";

import { calculateAge } from "../../utils/ageCalculator";

const RegisterSchema = Yup.object({
  username: Yup.string()
    .trim()
    .min(4, "Minimum 4 characters required")
    .max(20, "Maximum 20 characters allowed")
    .required("Username is required"),

  password: Yup.string()
    .min(8, "Minimum 8 characters required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
      "Include uppercase, lowercase, number and special character"
    )
    .required("Password is required"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),

  dob: Yup.date()
    .required("Date of birth is required")
    .max(new Date(), "DOB cannot be a future date")
    .test("age", "Minimum age should be 18", function (value) {
      if (!value) return false;
      return calculateAge(value) >= 18;
    }),

  city: Yup.string().required("City is required"),

  designation: Yup.string().required("Designation is required"),
});

function RegisterForm() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (values, { resetForm }) => {
    try {
      setError("");
      setSuccess("");

      const users = await getUsers();

      const exists = users.find(
        (user) =>
          user.username.toLowerCase() ===
          values.username.trim().toLowerCase()
      );

      if (exists) {
        setError("Username already exists.");
        return;
      }

      await registerUser({
        username: values.username.trim(),
        password: values.password,
        dob: values.dob,
        age: values.age,
        city: values.city,
        designation: values.designation,
      });

      setSuccess(
        "Registration successful! Waiting for admin approval."
      );

      resetForm();
    } catch (err) {
      console.error(err);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light p-2">

      {/* MAIN CARD */}
      <Card
        className="border-0 shadow rounded-4 overflow-hidden w-100"
        style={{ maxWidth: "850px" }}
      >

        {/* HEADER */}
        <Card.Header
          className="bg-primary text-white text-center border-0 py-3"
          style={{
            borderTopLeftRadius: "1rem",
            borderTopRightRadius: "1rem",
          }}
        >
          <div className="fs-2">
            <i className="bi bi-person-circle"></i>
          </div>

          <h4 className="fw-bold mb-1">
            Create Your Account 🚀
          </h4>

          <p className="small mb-0 opacity-75">
            Join the community. Let's make things happen!
          </p>
        </Card.Header>

        {/* BODY */}
        <Card.Body className="p-3">

          {success && (
            <Alert variant="success" className="py-2 mb-2 rounded-3">
              {success}
            </Alert>
          )}

          {error && (
            <Alert variant="danger" className="py-2 mb-2 rounded-3">
              {error}
            </Alert>
          )}

          <Formik
            initialValues={{
              username: "",
              password: "",
              confirmPassword: "",
              dob: "",
              age: "",
              city: "",
              designation: "",
            }}
            validationSchema={RegisterSchema}
            onSubmit={handleRegister}
          >
            {({
              setFieldValue,
              resetForm,
              isSubmitting,
            }) => (

              <Form>

                <h6 className="fw-bold text-primary mb-2">
                  <i className="bi bi-person-vcard me-2"></i>
                  Personal & Account Details
                </h6>

                <Row className="g-2">

                  {/* USERNAME */}
                  <Col md={6}>
                    <BootstrapForm.Label className="small fw-semibold mb-1">
                      Username
                    </BootstrapForm.Label>

                    <div className="input-group input-group-sm rounded-3 overflow-hidden">
                      <span className="input-group-text">
                        <i className="bi bi-person text-primary"></i>
                      </span>

                      <Field
                        name="username"
                        className="form-control"
                        placeholder="Enter username"
                        autoComplete="username"
                      />
                    </div>

                    <small className="text-danger">
                      <ErrorMessage name="username" />
                    </small>
                  </Col>

                  {/* PASSWORD */}
                  <Col md={6}>
                    <BootstrapForm.Label className="small fw-semibold mb-1">
                      Password
                    </BootstrapForm.Label>

                    <div className="input-group input-group-sm rounded-3 overflow-hidden">
                      <span className="input-group-text">
                        <i className="bi bi-lock text-primary"></i>
                      </span>

                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="form-control"
                        placeholder="Create password"
                        autoComplete="new-password"
                      />

                      <Button
                        type="button"
                        variant="outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i
                          className={
                            showPassword
                              ? "bi bi-eye-slash"
                              : "bi bi-eye"
                          }
                        ></i>
                      </Button>
                    </div>

                    <small className="text-danger">
                      <ErrorMessage name="password" />
                    </small>
                  </Col>

                  {/* CONFIRM PASSWORD */}
                  <Col md={6}>
                    <BootstrapForm.Label className="small fw-semibold mb-1">
                      Confirm Password
                    </BootstrapForm.Label>

                    <div className="input-group input-group-sm rounded-3 overflow-hidden">
                      <span className="input-group-text">
                        <i className="bi bi-shield-lock text-primary"></i>
                      </span>

                      <Field
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        className="form-control"
                        placeholder="Confirm password"
                        autoComplete="new-password"
                      />

                      <Button
                        type="button"
                        variant="outline-secondary"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        <i
                          className={
                            showConfirmPassword
                              ? "bi bi-eye-slash"
                              : "bi bi-eye"
                          }
                        ></i>
                      </Button>
                    </div>

                    <small className="text-danger">
                      <ErrorMessage name="confirmPassword" />
                    </small>
                  </Col>

                  {/* DOB */}
                  <Col md={6}>
                    <BootstrapForm.Label className="small fw-semibold mb-1">
                      Date of Birth
                    </BootstrapForm.Label>

                    <div className="input-group input-group-sm rounded-3 overflow-hidden">
                      <span className="input-group-text">
                        <i className="bi bi-calendar-event text-primary"></i>
                      </span>

                      <Field
                        type="date"
                        name="dob"
                        max={new Date().toISOString().split("T")[0]}
                        className="form-control"
                        onChange={(e) => {
                          const dob = e.target.value;

                          setFieldValue("dob", dob);
                          setFieldValue(
                            "age",
                            dob ? calculateAge(dob) : ""
                          );
                        }}
                      />
                    </div>

                    <small className="text-danger">
                      <ErrorMessage name="dob" />
                    </small>
                  </Col>

                  {/* AGE */}
                  <Col md={6}>
                    <BootstrapForm.Label className="small fw-semibold mb-1">
                      Age
                    </BootstrapForm.Label>

                    <div className="input-group input-group-sm rounded-3 overflow-hidden">
                      <span className="input-group-text">
                        <i className="bi bi-hourglass-split text-primary"></i>
                      </span>

                      <Field
                        disabled
                        name="age"
                        className="form-control bg-light"
                        placeholder="Auto calculated"
                      />

                      <span className="input-group-text">
                        Years
                      </span>
                    </div>
                  </Col>

                  {/* CITY */}
                  <Col md={6}>
                    <BootstrapForm.Label className="small fw-semibold mb-1">
                      City
                    </BootstrapForm.Label>

                    <div className="input-group input-group-sm rounded-3 overflow-hidden">
                      <span className="input-group-text">
                        <i className="bi bi-geo-alt text-primary"></i>
                      </span>

                      <Field
                        as="select"
                        name="city"
                        className="form-select"
                      >
                        <option value="">Select City</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Bangalore">Bangalore</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Pune">Pune</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Coimbatore">Coimbatore</option>
                      </Field>
                    </div>

                    <small className="text-danger">
                      <ErrorMessage name="city" />
                    </small>
                  </Col>

                  {/* DESIGNATION */}
                  <Col md={12}>
                    <BootstrapForm.Label className="small fw-semibold mb-1">
                      Designation
                    </BootstrapForm.Label>

                    <div className="input-group input-group-sm rounded-3 overflow-hidden">
                      <span className="input-group-text">
                        <i className="bi bi-briefcase text-primary"></i>
                      </span>

                      <Field
                        as="select"
                        name="designation"
                        className="form-select"
                      >
                        <option value="">Select Designation</option>
                        <option value="Software Engineer">
                          Software Engineer
                        </option>
                        <option value="Frontend Developer">
                          Frontend Developer
                        </option>
                        <option value="Backend Developer">
                          Backend Developer
                        </option>
                        <option value="QA Engineer">QA Engineer</option>
                        <option value="UI Developer">UI Developer</option>
                        <option value="HR Manager">HR Manager</option>
                      </Field>
                    </div>

                    <small className="text-danger">
                      <ErrorMessage name="designation" />
                    </small>
                  </Col>

                </Row>

                {/* APPROVAL NOTICE */}
                <Alert
                  variant="warning"
                  className="py-2 px-3 my-2 small rounded-3"
                >
                  <i className="bi bi-shield-check me-2"></i>
                  <strong>Heads up!</strong> New accounts require admin
                  approval before login.
                </Alert>

                {/* BUTTONS */}
                <Row className="g-2">

                  <Col xs={5}>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      className="w-100 rounded-3"
                      onClick={() => {
                        if (window.confirm("Clear all fields?")) {
                          resetForm();
                          setError("");
                          setSuccess("");
                          setShowPassword(false);
                          setShowConfirmPassword(false);
                        }
                      }}
                    >
                      <i className="bi bi-arrow-counterclockwise me-1"></i>
                      Reset
                    </Button>
                  </Col>

                  <Col xs={7}>
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100 fw-bold rounded-3"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          Create Account
                          <i className="bi bi-arrow-right-circle ms-2"></i>
                        </>
                      )}
                    </Button>
                  </Col>

                </Row>

                {/* LOGIN */}
                <div className="text-center mt-2 small">
                  <span className="text-muted">
                    Already have an account?
                  </span>

                  <Link
                    to="/"
                    className="text-primary fw-bold text-decoration-none ms-2"
                  >
                    Sign In
                  </Link>
                </div>

              </Form>
            )}
          </Formik>

        </Card.Body>
      </Card>
    </div>
  );
}

export default RegisterForm;
