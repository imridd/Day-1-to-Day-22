
import {
  Table,
  Badge,
  Button,
} from "react-bootstrap";

function UserTable({
  users,
  onActivate,
  onDeactivate,
}) {
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
            <th>User</th>
            <th>Age</th>
            <th>City</th>
            <th>Designation</th>
            <th>Status</th>
            <th width="220">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>

          {users.length > 0 ? (
            users.map(
              (
                user,
                index
              ) => (
                <tr
                  key={user.id}
                >

                  {/* S.No */}

                  <td>
                    <strong>
                      {index + 1}
                    </strong>
                  </td>

                  {/* User */}

                  <td>

                    <div>

                      <h6 className="fw-bold mb-0">
                        {user.username}
                      </h6>

                      <small className="text-muted">
                        Registered User
                      </small>

                    </div>

                  </td>

                  {/* Age */}

                  <td>
                    {user.age}
                  </td>

                  {/* City */}

                  <td>

                    <Badge bg="info">
                      {user.city}
                    </Badge>

                  </td>

                  {/* Designation */}

                  <td>
                    {user.designation}
                  </td>

                  {/* Status */}

                  <td>

                    {user.status ===
                    "active" ? (

                      <Badge bg="success">
                        Active
                      </Badge>

                    ) : (

                      <Badge
                        bg="warning"
                        text="dark"
                      >
                        Pending Approval
                      </Badge>

                    )}

                  </td>

                  {/* Actions */}

                  <td>

                    {user.status ===
                    "inactive" ? (

                      <Button
                        size="sm"
                        variant="success"
                        className="app-btn"
                        onClick={() =>
                          onActivate(user)
                        }
                      >
                        <i className="bi bi-check-circle me-1"></i>
                        Activate
                      </Button>

                    ) : (

                      <Button
                        size="sm"
                        variant="danger"
                        className="app-btn"
                        onClick={() =>
                          onDeactivate(user)
                        }
                      >
                        <i className="bi bi-x-circle me-1"></i>
                        Deactivate
                      </Button>

                    )}

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
                    No Users Found
                  </h5>

                  <p className="text-muted mb-0">
                    No registered users available.
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

export default UserTable;