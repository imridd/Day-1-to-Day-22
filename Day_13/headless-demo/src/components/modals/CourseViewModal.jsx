
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";

function CourseViewModal({
  show,
  onHide,
  course,
}) {
  if (!course) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Course Details
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Table bordered>
          <tbody>

            <tr>
              <td>
                <strong>
                  Course Name
                </strong>
              </td>
              <td>
                {course.name}
              </td>
            </tr>

            <tr>
              <td>
                <strong>
                  Trainer
                </strong>
              </td>
              <td>
                {course.trainer}
              </td>
            </tr>

            <tr>
              <td>
                <strong>
                  Duration
                </strong>
              </td>
              <td>
                {course.duration}
              </td>
            </tr>

            <tr>
              <td>
                <strong>
                  Fee
                </strong>
              </td>
              <td>
                ₹{course.fee}
              </td>
            </tr>

            <tr>
              <td>
                <strong>
                  Enrolled Students
                </strong>
              </td>
              <td>
                {course.enrolledStudents}
              </td>
            </tr>

          </tbody>
        </Table>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onHide}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CourseViewModal;