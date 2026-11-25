import Card from "react-bootstrap/Card";

function AppCard({
  children
}) {
  return (
    <Card
      className="
      glass-card
      border-0
      shadow-lg
      "
    >
      <Card.Body>
        {children}
      </Card.Body>
    </Card>
  );
}

export default AppCard;