import { Row, Col } from "react-bootstrap";

function PageHeader({
  title,
  subtitle
}) {
  return (
    <Row className="mb-4">
      <Col>

        <h2 className="fw-bold">
          {title}
        </h2>

        <p className="text-muted">
          {subtitle}
        </p>

      </Col>
    </Row>
  );
}

export default PageHeader;