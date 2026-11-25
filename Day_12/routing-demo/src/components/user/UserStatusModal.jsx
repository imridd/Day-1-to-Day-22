
import {
  Modal,
  Button,
} from "react-bootstrap";

function UserStatusModal({
  show,
  onHide,
  onConfirm,
  actionType,
  username,
}) {
  const isActivate =
    actionType === "Activate";

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>

        <Modal.Title>

          {isActivate
            ? "✅ Activate User"
            : "🚫 Deactivate User"}

        </Modal.Title>

      </Modal.Header>

      <Modal.Body>

        <div className="text-center">

          <div className="mb-3">

            <i
              className={`bi ${
                isActivate
                  ? "bi-person-check-fill text-success"
                  : "bi-person-x-fill text-danger"
              } fs-1`}
            ></i>

          </div>

          <h5 className="fw-bold">

            {isActivate
              ? "Activate User?"
              : "Deactivate User?"}

          </h5>

          <p className="text-muted mb-0">

            Are you sure you want to

            <strong>
              {" "}
              {actionType.toLowerCase()}{" "}
            </strong>

            <strong>
              {username}
            </strong>

            ?

          </p>

        </div>

      </Modal.Body>

      <Modal.Footer>

        <Button
          variant="outline-secondary"
          onClick={onHide}
        >
          Cancel
        </Button>

        <Button
          variant={
            isActivate
              ? "success"
              : "danger"
          }
          className="app-btn"
          onClick={onConfirm}
        >
          {actionType}
        </Button>

      </Modal.Footer>

    </Modal>
  );
}

export default UserStatusModal;