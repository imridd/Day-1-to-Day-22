import {
  Container,
  Row,
  Col
} from "react-bootstrap";

import EmployeeDepartmentChart from "../../components/charts/EmployeeDepartmentChart";

import UserStatusChart from "../../components/charts/UserStatusChart";

import ProductPriceChart from "../../components/charts/ProductPriceChart";

function ChartsPage() {

  return (

    <Container fluid className="py-4">

      <h2 className="fw-bold mb-4">

        Analytics Dashboard

      </h2>

      <Row className="g-4">

        <Col lg={6}>

          <EmployeeDepartmentChart />

        </Col>

        <Col lg={6}>

          <UserStatusChart />

        </Col>

      </Row>

      <Row className="mt-4">

        <Col>

          <ProductPriceChart />

        </Col>

      </Row>

    </Container>

  );
}

export default ChartsPage;