import {
  Navbar,
  Container,
  Nav,
  Button,
  Badge,
} from "react-bootstrap";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router";

import useAuth from "../../hooks/useAuth";
import ThemeToggle from "./ThemeToggle";

function RoleNavbar() {
  const navigate = useNavigate();

  const location = useLocation();

  const {
    currentUser,
    role,
    logout,
  } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Navbar
      bg="light"
      expand="lg"
      sticky="top"
      className="shadow-sm mb-3"
    >
      <Container fluid>

        <Navbar.Brand
          as={Link}
          to="/dashboard"
          className="fw-bold text-primary"
        >
          React Portal
        </Navbar.Brand>

        <Navbar.Toggle />

        <Navbar.Collapse>

          <Nav className="me-auto">

            <Nav.Link
              as={Link}
              to="/dashboard"
              active={isActive("/dashboard")}
            >
              Dashboard
            </Nav.Link>

            {role === "admin" && (
              <Nav.Link
                as={Link}
                to="/user-management"
                active={isActive("/user-management")}
              >
                Users
              </Nav.Link>
            )}

            <Nav.Link
              as={Link}
              to="/products"
              active={isActive("/products")}
            >
              Products
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/employees"
              active={isActive("/employees")}
            >
              Employees
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/charts"
              active={isActive("/charts")}
            >
              Charts
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/reports"
              active={isActive("/reports")}
            >
              Reports
            </Nav.Link>

          </Nav>

          <div className="d-flex align-items-center gap-2">

            <ThemeToggle />

            <Badge
              bg="primary"
              pill
              className="px-3 py-2"
            >
              {currentUser?.username}
            </Badge>

            <Button
              variant="outline-danger"
              onClick={handleLogout}
            >
              Logout
            </Button>

          </div>

        </Navbar.Collapse>

      </Container>
    </Navbar>
  );
}

export default RoleNavbar;