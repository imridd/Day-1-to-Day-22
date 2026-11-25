import {
  Table,
  Button,
  Badge,
} from "react-bootstrap";

import { useNavigate } from "react-router";

function EmployeeTable({
  employees,
  onDelete,
}) {
  const navigate = useNavigate();

  return (
    <div className="table-responsive">

      <Table
        hover
        bordered
        className="
        align-middle
        app-table
        "
      >
        <thead>
          <tr>
            <th>S.No</th>
            <th>Employee</th>
            <th>Email</th>
            <th>Department</th>
            <th>Salary</th>
            <th>Status</th>
            <th width="200">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>

          {employees.length > 0 ? (
            employees.map(
              (
                employee,
                index
              ) => (
                <tr
                  key={employee.id}
                >

                  {/* S.No */}

                  <td>
                    <strong>
                      {index + 1}
                    </strong>
                  </td>

                  {/* Employee */}

                  <td>

                    <div>

                      <h6 className="fw-bold mb-0">
                        {employee.name}
                      </h6>

                      <small className="text-muted">
                        Employee
                      </small>

                    </div>

                  </td>

                  {/* Email */}

                  <td>
                    {employee.email}
                  </td>

                  {/* Department */}

                  <td>

                    <Badge bg="info">
                      {employee.department}
                    </Badge>

                  </td>

                  {/* Salary */}

                  <td className="fw-bold text-success">

                    ₹
                    {Number(
                      employee.salary
                    ).toLocaleString()}

                  </td>

                  {/* Status */}

                  <td>

                    <Badge bg="success">
                      Active
                    </Badge>

                  </td>

                  {/* Actions */}

                  <td>

                    <div className="d-flex gap-2">

                      <Button
                        size="sm"
                        variant="primary"
                        className="app-btn"
                        onClick={() =>
                          navigate(
                            `/employees/view/${employee.id}`
                          )
                        }
                      >
                        <i className="bi bi-eye"></i>
                      </Button>

                      <Button
                        size="sm"
                        variant="warning"
                        className="app-btn"
                        onClick={() =>
                          navigate(
                            `/employees/edit/${employee.id}`
                          )
                        }
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>

                      <Button
                        size="sm"
                        variant="danger"
                        className="app-btn"
                        onClick={() =>
                          onDelete(
                            employee.id
                          )
                        }
                      >
                        <i className="bi bi-trash"></i>
                      </Button>

                    </div>

                  </td>

                </tr>
              )
            )
          ) : (
            <tr>

              <td
                colSpan="7"
                className="
                text-center
                py-4
                "
              >

                <div>

                  <h5 className="text-muted">
                    No Employees Found
                  </h5>

                  <p className="text-muted mb-0">
                    Add a new employee
                    to get started.
                  </p>

                </div>

              </td>

            </tr>
          )}

        </tbody>

      </Table>

    </div>
  );
}

export default EmployeeTable;