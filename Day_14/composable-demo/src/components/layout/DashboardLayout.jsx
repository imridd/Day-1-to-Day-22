
import { Container, Row, Col } from "react-bootstrap";
import { Outlet } from "react-router-dom";

import Navbar from "../common/Navbar";
import Sidebar from "../common/SideBar";


function DashboardLayout() {
  return (
    <div className="app-container">
      <Navbar />

      <Container fluid>
        <Row>
          <Col lg={2} md={3} className="sidebar-column">
            <Sidebar/>
          </Col>

          <Col lg={10} md={9} className="main-content">
            <Outlet />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default DashboardLayout;

