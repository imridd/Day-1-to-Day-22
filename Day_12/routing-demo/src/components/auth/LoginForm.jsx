
import { useState } from "react";

import {
  Formik,
  Form,
  Field,
  ErrorMessage,
} from "formik";

import * as Yup from "yup";

import {
  Button,
  Card,
  Alert,
  Form as BootstrapForm,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";

import {
  useNavigate,
  Link,
} from "react-router";

import { loginAdmin } from "../../services/adminService";
import { loginUser } from "../../services/userService";

import useAuth from "../../hooks/useAuth";

const LoginSchema = Yup.object({
  username: Yup.string()
    .required("Username is required"),

  password: Yup.string()
    .required("Password is required"),
});

function LoginForm() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      setError("");

      // ADMIN LOGIN
      const admin = await loginAdmin(
        values.username,
        values.password
      );

      if (admin) {
        login(admin);
        navigate("/dashboard");
        return;
      }

      // USER LOGIN
      const user = await loginUser(
        values.username,
        values.password
      );

      if (!user) {
        setError("Invalid Username or Password");
        return;
      }

      // ACCOUNT APPROVAL CHECK
      if (user.status !== "active") {
        setError(
          "Your account is waiting for admin approval."
        );
        return;
      }

      login(user);
      navigate("/dashboard");

    } catch (error) {
      console.error(error);

      setError(
        "Login Failed. Please Try Again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light p-2">

      {/* MAIN CARD */}
      <Card
        className="border-0 shadow rounded-4 overflow-hidden w-100"
        style={{ maxWidth: "500px" }}
      >

        {/* HEADER */}
        <Card.Header
          className="bg-primary text-white text-center border-0 py-3"
          style={{
            borderTopLeftRadius: "1rem",
            borderTopRightRadius: "1rem",
          }}
        >
          <div className="fs-1">
            <i className="bi bi-person-circle"></i>
          </div>

          <h4 className="fw-bold mb-1">
            Welcome Back 👋
          </h4>

          <p className="small mb-0 opacity-75">
            Products • Employees • Analytics
          </p>
        </Card.Header>

        {/* BODY */}
        <Card.Body className="p-3">

          {/* ERROR MESSAGE */}
          {error && (
            <Alert
              variant="danger"
              className="py-2 mb-3 rounded-3"
            >
              <i className="bi bi-exclamation-circle me-2"></i>
              {error}
            </Alert>
          )}

          <Formik
            initialValues={{
              username: "",
              password: "",
            }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
          >
            <Form>

              <h6 className="fw-bold text-primary mb-3">
                <i className="bi bi-shield-lock me-2"></i>
                Account Login
              </h6>

              <Row className="g-3">

                {/* USERNAME */}
                <Col xs={12}>
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
                <Col xs={12}>
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
                      placeholder="Enter password"
                      autoComplete="current-password"
                    />

                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
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

              </Row>

              {/* REMEMBER & FORGOT PASSWORD */}
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 my-3">

                <BootstrapForm.Check
                  type="checkbox"
                  label="Remember Me"
                  className="small"
                />

                <Button
                  type="button"
                  variant="link"
                  className="p-0 text-decoration-none small"
                >
                  Forgot Password?
                </Button>

              </div>

              {/* LOGIN BUTTON */}
              <Button
                type="submit"
                variant="primary"
                className="w-100 fw-bold rounded-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      animation="border"
                      size="sm"
                      className="me-2"
                    />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <i className="bi bi-arrow-right-circle ms-2"></i>
                  </>
                )}
              </Button>

              {/* REGISTER LINK */}
              <div className="text-center mt-3 small">

                <span className="text-muted">
                  New User?
                </span>

                <Link
                  to="/register"
                  className="text-primary fw-bold text-decoration-none ms-2"
                >
                  Register Here
                </Link>

              </div>

              <hr className="my-3" />

              {/* FOOTER */}
              <div className="text-center">
                <small className="text-muted">
                  Built with React <i className="bi bi-heart-fill text-danger"></i>
                </small>
              </div>

            </Form>
          </Formik>

        </Card.Body>
      </Card>
    </div>
  );
}

export default LoginForm;
