
import { useState } from "react";

import {
  Navbar as BootstrapNavbar,
  Container,
  Form,
  InputGroup,
  Button,
  Dropdown,
} from "react-bootstrap";

import { NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

function Navbar() {
  const [search, setSearch] = useState("");
  const { theme, toggleTheme } = useTheme();

  return (
    <BootstrapNavbar
      expand="lg"
      className="top-navbar py-3"
    >
      <Container fluid className="px-3 px-lg-4">

        {/* BRAND */}
        <BootstrapNavbar.Brand
          as={NavLink}
          to="/dashboard"
          className="fw-bold fs-4 d-flex align-items-center gap-2"
        >
          <span className="brand-icon">✦</span>
          <span>
            Vibe<span className="brand-highlight">Core.</span>
          </span>
        </BootstrapNavbar.Brand>

        <div className="d-flex align-items-center gap-2 gap-md-3 ms-auto">

          {/* SEARCH */}
          <InputGroup className="navbar-search d-none d-md-flex">
            <InputGroup.Text>
              🔍
            </InputGroup.Text>

            <Form.Control
              type="search"
              placeholder="Search anything..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>

          {/* THEME TOGGLE */}
          <Button
            className="theme-toggle"
            variant="light"
            onClick={toggleTheme}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            aria-label="Toggle website theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </Button>

          {/* NOTIFICATIONS */}
          <Button
            variant="light"
            className="navbar-icon-button position-relative"
            aria-label="Notifications"
          >
            🔔
            <span className="notification-dot" />
          </Button>

          {/* PROFILE */}
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="light"
              className="profile-toggle d-flex align-items-center gap-2"
            >
              <div className="profile-avatar">
                R
              </div>

              <div className="d-none d-md-block text-start">
                <div className="profile-name">Rid</div>
                <small className="profile-role">Admin</small>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu className="profile-menu shadow border-0">
              <Dropdown.Item>
                👤 My Profile
              </Dropdown.Item>

              <Dropdown.Item>
                ⚙️ Settings
              </Dropdown.Item>

              <Dropdown.Divider />

              <Dropdown.Item className="text-danger">
                🚪 Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

        </div>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
