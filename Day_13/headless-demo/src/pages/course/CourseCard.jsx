import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

function CourseCard({
  course,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <Card className="employee-card p-3">
      <Card.Body>
        <h5>{course.name}</h5>

        <p>
          Trainer:
          {course.trainer}
        </p>

        <p>
          Duration:
          {course.duration}
        </p>

        <p>
          Fee: ₹{course.fee}
        </p>

        <p>
          Students:
          {
            course.enrolledStudents
          }
        </p>

        <div className="d-flex gap-2">
          <Button
            size="sm"
            onClick={() =>
              onView(course)
            }
          >
            View
          </Button>

          <Button
            size="sm"
            variant="warning"
            onClick={() =>
              onEdit(course)
            }
          >
            Edit
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() =>
              onDelete(course.id)
            }
          >
            Delete
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default CourseCard;