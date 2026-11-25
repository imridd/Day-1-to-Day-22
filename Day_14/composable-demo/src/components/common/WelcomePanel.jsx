
import { Card, Badge } from "react-bootstrap";

function WelcomePanel({ title, subtitle }) {
  return (
    <Card className="border-0 shadow-sm rounded-4 welcome-panel">
      <Card.Body className="p-4 p-md-5">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">

          <div>
            <Badge bg="light" text="dark" className="mb-3 rounded-pill px-3 py-2">
              YOUR SPACE ✨
            </Badge>

            <h2 className="fw-bold mb-2">
              {title}
            </h2>

            <p className="mb-0 text-secondary">
              {subtitle}
            </p>
          </div>

          <div className="welcome-emoji">
            🚀
          </div>

        </div>
      </Card.Body>
    </Card>
  );
}

export default WelcomePanel;
