
import { useEffect } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { loadPages } from "../features/pages/pageSlice";
import { loadNavigation } from "../features/navigation/navigationSlice";

export default function PublicLayout() {
  const dispatch = useDispatch();
  const location = useLocation();

  const { items = [] } = useSelector((state) => state.pages);
  const { position = "top" } = useSelector((state) => state.navigation);

  useEffect(() => {
    dispatch(loadPages());
    dispatch(loadNavigation());
  }, [dispatch]);

  const pages = items.filter(
    (page) => page.status === "published"
  );

  const isActive = (page) =>
    location.pathname === `/${page.slug}`;
  if (position === "left") {
    return (
      <div className="public-left">
        <aside>
          <Link className="brand" to="/">
            ✳ ORBIT
          </Link>

          {pages.map((page) => (
            <Link
              key={page.id}
              className={`public-nav-link ${
                isActive(page) ? "active" : ""
              }`}
              to={`/${page.slug}`}
            >
              {page.navigationLabel || page.pageName}
            </Link>
          ))}

          <Link className="public-nav-link" to="/login">
            More
          </Link>
        </aside>

        <main className="public-main">
          <Outlet />
        </main>
      </div>
    );
  }
  return (
    <>
      <Navbar expand="lg" className="public-navbar">
        <Container>
          <Navbar.Brand
            as={Link}
            to="/"
            className="brand"
          >
            ✳ ORBIT
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="public-navbar-collapse" />

          <Navbar.Collapse id="public-navbar-collapse">
            <Nav className="ms-auto">
              {pages.map((page) => (
                <Nav.Link
                  as={Link}
                  key={page.id}
                  to={`/${page.slug}`}
                  active={isActive(page)}
                >
                  {page.navigationLabel || page.pageName}
                </Nav.Link>
              ))}

              <Nav.Link as={Link} to="/login">
                More
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Outlet />
    </>
  );
}
