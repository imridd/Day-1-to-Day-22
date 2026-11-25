import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import { Alert, Button, Card, Form } from "react-bootstrap";
import { login } from "../features/auth/authSlice";
export default function Login() {
  const dispatch = useDispatch(),
    navigate = useNavigate(),
    { status, error } = useSelector((s) => s.auth);
  return (
    <main className="auth-wrap">
      <Card className="auth-card border-0 shadow-lg">
        <Card.Body className="p-4 p-md-5">
          <Link to="/" className="brand">
            ✳ ORBIT
          </Link>
          <h2 className="fw-bold">Welcome back.</h2>
          <p className="text-secondary">Sign in to shape your website.</p>
          {error && <Alert variant="danger">{error}</Alert>}
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={Yup.object({
              email: Yup.string()
                .email("Enter a valid email")
                .required("Email is required"),
              password: Yup.string().required("Password is required"),
            })}
            onSubmit={async (v) => {
              const r = await dispatch(login(v));
              if (login.fulfilled.match(r)) navigate("/admin");
            }}
          >
            {({ handleSubmit, handleChange, values, errors, touched }) => (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    isInvalid={touched.email && !!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    isInvalid={touched.password && !!errors.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>
                <Button
                  type="submit"
                  className="w-100 rounded-pill py-2"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Signing in…" : "Enter dashboard ↗"}
                </Button>
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </main>
  );
}
