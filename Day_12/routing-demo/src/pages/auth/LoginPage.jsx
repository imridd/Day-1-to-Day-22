import { Container, Row, Col } from "react-bootstrap";
import LoginForm from "../../components/auth/LoginForm";

function LoginPage() {
  return (
    <Container fluid className="auth-page">
      <Row className="min-vh-100 align-items-center justify-content-center">

        <Col lg={5} md={8}>
          <LoginForm />
        </Col>

      </Row>
    </Container>
  );
}

export default LoginPage;