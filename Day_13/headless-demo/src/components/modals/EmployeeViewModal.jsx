import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

function EmployeeViewModal({
  show,
  employee,
  onHide,
}) {
  if (!employee) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Employee Details
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          <strong>Name:</strong>{" "}
          {employee.name}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {employee.email}
        </p>

        <p>
          <strong>Department:</strong>{" "}
          {employee.department}
        </p>

        <p>
          <strong>Designation:</strong>{" "}
          {employee.designation}
        </p>

        <p>
          <strong>Salary:</strong> ₹
          {employee.salary}
        </p>

        <p>
          <strong>Joining Date:</strong>{" "}
          {employee.joiningDate}
        </p>
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

export default EmployeeViewModal;
