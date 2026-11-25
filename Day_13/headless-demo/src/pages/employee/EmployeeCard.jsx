import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

function EmployeeCard({
  employee,
  onView,
  onEdit,
  onDelete
}) {
  const gradients = [
    "linear-gradient(135deg,#2563eb,#4f46e5)",
    "linear-gradient(135deg,#10b981,#059669)",
    "linear-gradient(135deg,#f59e0b,#d97706)",
    "linear-gradient(135deg,#ef4444,#dc2626)",
    "linear-gradient(135deg,#8b5cf6,#7c3aed)",
    "linear-gradient(135deg,#06b6d4,#0891b2)",
  ];

  const avatarBg =
    gradients[
    employee.name.charCodeAt(0) %
    gradients.length
    ];


  return (
    <Card className="employee-card">

      <div
        className="employee-avatar"
        style={{
          background: avatarBg,
        }}
      >
        {employee.name.charAt(0).toUpperCase()}
      </div>

      <Card.Body>

        <h5>
          {employee.name}
        </h5>

        <p>
          {employee.department}
        </p>

        <p>
          {employee.email}
        </p>

        <div
          className="d-flex gap-2"
        >

          <Button
            size="sm"
            onClick={() =>
              onView(employee)}
          >
            View
          </Button>

          <Button
            size="sm"
            variant="warning"
            onClick={() =>
              onEdit(employee)}
          >
            Edit
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() =>
              onDelete(employee.id)}
          >
            Delete
          </Button>
        </div>

      </Card.Body>

    </Card>
  );
}

export default EmployeeCard;