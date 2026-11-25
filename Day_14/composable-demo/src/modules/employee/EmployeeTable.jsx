
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Card,
  Table,
  Badge,
  Form,
  InputGroup,
  Spinner,
  Alert,
  Button,
  Modal,
} from "react-bootstrap";

import {
  fetchEmployees,
  removeEmployee,
} from "./employeeSlice";

import EmployeeForm from "./EmployeeForm";
import { useNotification } from "../../components/common/NotificationProvider";

function EmployeeTable() {
  const dispatch = useDispatch();
  const { notify } = useNotification();

  const { employees, loading, error } = useSelector(
    (state) => state.employees
  );

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const handleAdd = () => {
    setSelectedEmployee(null);
    setShowForm(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setShowForm(true);
  };

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;

    setDeleting(true);

    try {
      await dispatch(removeEmployee(employeeToDelete.id)).unwrap();

      notify(
        `${employeeToDelete.name} deleted successfully!`,
        "success"
      );

      setShowDeleteModal(false);
      setEmployeeToDelete(null);
    } catch (err) {
      notify(
        typeof err === "string" ? err : "Unable to delete employee.",
        "danger"
      );
    } finally {
      setDeleting(false);
    }
  };

  const filteredEmployees = employees.filter((employee) =>
    `${employee.name} ${employee.email} ${employee.department} ${employee.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      <Card className="border-0 shadow-sm rounded-4 employee-table-card">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
              <h4 className="fw-bold mb-1">Team Members</h4>
              <p className="text-secondary mb-0">
                Manage and track your employees
              </p>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <InputGroup style={{ maxWidth: "250px" }}>
                <InputGroup.Text className="bg-light border-0">
                  🔍
                </InputGroup.Text>

                <Form.Control
                  placeholder="Search employees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-light border-0"
                />
              </InputGroup>

              <Button
                variant="primary"
                onClick={handleAdd}
                className="rounded-3"
              >
                + Add Employee
              </Button>
            </div>
          </div>

          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-secondary mt-2">
                Loading employees...
              </p>
            </div>
          )}

          {!loading && error && (
            <Alert variant="danger">
              {error}

              <Button
                size="sm"
                variant="outline-danger"
                className="ms-3"
                onClick={async () => {
                  try {
                    await dispatch(fetchEmployees()).unwrap();
                    notify("Employees loaded successfully!", "success");
                  } catch {
                    notify("Unable to load employees.", "danger");
                  }
                }}
              >
                Retry
              </Button>
            </Alert>
          )}

          {!loading && !error && (
            <>
              <div className="table-responsive">
                <Table hover className="align-middle employee-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee) => (
                        <tr key={employee.id}>
                          <td>
                            <div className="fw-semibold">
                              {employee.name}
                            </div>

                            <small className="text-secondary">
                              {employee.email}
                            </small>
                          </td>

                          <td>{employee.department}</td>
                          <td>{employee.role}</td>

                          <td>
                            <Badge
                              bg={
                                employee.status === "Active"
                                  ? "success"
                                  : employee.status === "On Leave"
                                  ? "warning"
                                  : "secondary"
                              }
                              className="rounded-pill px-3 py-2"
                            >
                              {employee.status}
                            </Badge>
                          </td>

                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => handleEdit(employee)}
                              >
                                Edit
                              </Button>

                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDeleteClick(employee)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          No employees found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              <div className="text-secondary small mt-3">
                Showing {filteredEmployees.length} of {employees.length} employees
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      <EmployeeForm
        show={showForm}
        onHide={() => {
          setShowForm(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
      />

      {/* Delete confirmation modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => {
          if (!deleting) {
            setShowDeleteModal(false);
            setEmployeeToDelete(null);
          }
        }}
        centered
      >
        <Modal.Header closeButton={!deleting}>
          <Modal.Title>🗑️ Delete Employee?</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to delete{" "}
          <strong>{employeeToDelete?.name}</strong>?
          This action cannot be undone.
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="light"
            disabled={deleting}
            onClick={() => {
              setShowDeleteModal(false);
              setEmployeeToDelete(null);
            }}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            disabled={deleting}
            onClick={handleDeleteConfirm}
          >
            {deleting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              "Yes, Delete"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default EmployeeTable;
