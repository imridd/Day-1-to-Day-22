import { Button, Container } from "react-bootstrap";
export default function EmptyState({ onCreate }) {
  return (
    <Container className="empty-state text-center">
      <div className="orb">✳</div>
      <h1 className="display-3 fw-bold mt-3">No Content Here!</h1>
      <p className="text-secondary fs-5">
        Your website is waiting for its first page. Create your first page to
        get started.
      </p>
      <Button onClick={onCreate} size="lg" className="rounded-pill px-4">
        Create Content ↗
      </Button>
    </Container>
  );
}
