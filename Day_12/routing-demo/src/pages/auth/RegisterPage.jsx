import { Container, Row, Col } from "react-bootstrap";
import RegisterForm from "../../components/auth/RegisterForm";

function RegisterPage() {
  return (
    <Container fluid className="auth-page">
      <Row className="min-vh-100 align-items-center justify-content-center">

        <Col lg={8}>
          <RegisterForm />
        </Col>

      </Row>
    </Container>
  );
}

export default RegisterPage;