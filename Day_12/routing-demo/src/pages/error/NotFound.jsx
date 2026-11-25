import { Link } from "react-router";

import {
  Container,
  Card,
  Button,
} from "react-bootstrap";

function NotFound() {
  return (
    <Container
      fluid
      className="
      d-flex
      justify-content-center
      align-items-center
      min-vh-100
      fade-up
      "
    >
      <Card
        className="
        glass-card
        border-0
        text-center
        p-4
        "
        style={{
          maxWidth: "600px",
        }}
      >
        <Card.Body>

          <div
            style={{
              fontSize: "6rem",
            }}
          >
            🚀
          </div>

          <h1
            className="
            fw-bold
            display-1
            mb-0
            text-primary
            "
          >
            404
          </h1>

          <h3 className="fw-bold mt-3">
            Page Not Found
          </h3>

          <p className="text-muted mb-4">
            The page you are looking for
            does not exist or may have
            been moved.
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap">

            <Button
              as={Link}
              to="/dashboard"
              variant="primary"
              className="app-btn"
            >
              Go To Dashboard
            </Button>

            <Button
              as={Link}
              to="/products"
              variant="outline-primary"
              className="app-btn"
            >
              Products
            </Button>

            <Button
              as={Link}
              to="/employees"
              variant="outline-secondary"
              className="app-btn"
            >
              Employees
            </Button>

          </div>

        </Card.Body>
      </Card>
    </Container>
  );
}

export default NotFound;