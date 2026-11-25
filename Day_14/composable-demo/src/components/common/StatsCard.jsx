
import { Card, Badge } from "react-bootstrap";

function StatsCard({ title, value, icon, trend = "+12%" }) {
  return (
    <Card className="border-0 shadow-sm rounded-4 stats-card h-100">
      <Card.Body className="p-4">

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="stats-icon">
            {icon}
          </div>

          <Badge bg="success-subtle" text="success" className="rounded-pill">
            {trend}
          </Badge>
        </div>

        <p className="text-secondary fw-medium mb-1">
          {title}
        </p>

        <h2 className="fw-bold mb-0">
          {value}
        </h2>

      </Card.Body>
    </Card>
  );
}

export default StatsCard;
