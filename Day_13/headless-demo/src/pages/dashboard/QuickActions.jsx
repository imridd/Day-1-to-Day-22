import { useNavigate } from "react-router";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card className="glass-card">
      <Card.Body className="d-flex gap-2 flex-wrap">

        <Button
          variant="primary"
          onClick={() =>
            navigate("/employees")
          }
        >
          Add Employee
        </Button>

        <Button
          variant="success"
          onClick={() =>
            navigate("/products")
          }
        >
          Add Product
        </Button>

        <Button
          variant="warning"
          onClick={() =>
            navigate("/courses")
          }
        >
          Add Course
        </Button>

      </Card.Body>
    </Card>
  );
}

export default QuickActions;
