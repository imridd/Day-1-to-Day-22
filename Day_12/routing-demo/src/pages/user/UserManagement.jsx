
import { useEffect, useState } from "react";

import {
  Container,
  Row,
  Col,
  Form,
  Badge,
  Alert,
  Card,
} from "react-bootstrap";

import AppCard from "../../components/common/AppCard";
import Loader from "../../components/common/Loader";

import {
  getAllUsers,
  activateUser,
  deactivateUser,
} from "../../services/adminService";

import UserTable from "../../components/user/UserTable";
import UserStatusModal from "../../components/user/UserStatusModal";

function UserManagement() {

  const [users, setUsers] =
    useState([]);

  const [filteredUsers,
    setFilteredUsers] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  const [error,
    setError] =
    useState("");

  const [search,
    setSearch] =
    useState("");

  const [statusFilter,
    setStatusFilter] =
    useState("all");

  const [showModal,
    setShowModal] =
    useState(false);

  const [selectedUser,
    setSelectedUser] =
    useState(null);

  const [actionType,
    setActionType] =
    useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, search, statusFilter]);

  const loadUsers = async () => {
    try {

      setLoading(true);

      const data =
        await getAllUsers();

      setUsers(data);

      setFilteredUsers(data);

      setError("");

    } catch (error) {

      console.error(error);

      setError(
        "Unable to load users"
      );

    } finally {

      setLoading(false);

    }
  };

  const applyFilters = () => {

    let result =
      [...users];

    if (
      search.trim()
    ) {

      result =
        result.filter(
          (user) =>
            user.username
              .toLowerCase()
              .includes(
                search.toLowerCase()
              )
        );

    }

    if (
      statusFilter !== "all"
    ) {

      result =
        result.filter(
          (user) =>
            user.status ===
            statusFilter
        );

    }

    setFilteredUsers(
      result
    );
  };

  const handleActivate =
    (user) => {

      setSelectedUser(
        user
      );

      setActionType(
        "Activate"
      );

      setShowModal(
        true
      );
    };

  const handleDeactivate =
    (user) => {

      setSelectedUser(
        user
      );

      setActionType(
        "Deactivate"
      );

      setShowModal(
        true
      );
    };

  const confirmAction =
    async () => {

      try {

        if (
          actionType ===
          "Activate"
        ) {

          await activateUser(
            selectedUser.id
          );

        } else {

          await deactivateUser(
            selectedUser.id
          );

        }

        await loadUsers();

        setShowModal(
          false
        );

        setSelectedUser(
          null
        );

        setActionType(
          ""
        );

      } catch (error) {

        console.error(
          error
        );

      }
    };

  const activeUsers =
    users.filter(
      (user) =>
        user.status ===
        "active"
    ).length;

  const inactiveUsers =
    users.filter(
      (user) =>
        user.status ===
        "inactive"
    ).length;

  if (loading) {
    return <Loader />;
  }

  return (
    <Container
      fluid
      className="
      py-4
      px-4
      fade-up
      "
    >
      {/* Header */}

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            User Management 👥
          </h2>

          <p className="text mb-2">
            Review registrations,
            approve accounts and
            manage platform access.
          </p>

        </div>

        <Badge
          bg="warning"
          className="fs-6"
        >
          Pending Approval:
          {" "}
          {inactiveUsers}
        </Badge>

      </div>

      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      {/* Statistics */}

      <Row className="g-4 mb-4">

        <Col md={4}>

          <AppCard>

            <div className="text-center">

              <i className="bi bi-people-fill fs-1 text-primary"></i>

              <h3 className="fw-bold mt-3">
                {users.length}
              </h3>

              <h6>
                Total Users
              </h6>

            </div>

          </AppCard>

        </Col>

        <Col md={4}>

          <AppCard>

            <div className="text-center">

              <i className="bi bi-person-check-fill fs-1 text-success"></i>

              <h3 className="fw-bold mt-3">
                {activeUsers}
              </h3>

              <h6>
                Active Users
              </h6>

            </div>

          </AppCard>

        </Col>

        <Col md={4}>

          <AppCard>

            <div className="text-center">

              <i className="bi bi-person-x-fill fs-1 text-danger"></i>

              <h3 className="fw-bold mt-3">
                {inactiveUsers}
              </h3>

              <h6>
                Inactive Users
              </h6>

            </div>

          </AppCard>

        </Col>

      </Row>

      {/* Summary */}

      <Card className="glass-card border-0 mb-4">

        <Card.Body>

          <Row>

            <Col md={4}>
              <strong>
                Total Users:
              </strong>
              {" "}
              {users.length}
            </Col>

            <Col md={4}>
              <strong>
                Active Users:
              </strong>
              {" "}
              {activeUsers}
            </Col>

            <Col md={4}>
              <strong>
                Pending Approval:
              </strong>
              {" "}
              {inactiveUsers}
            </Col>

          </Row>

        </Card.Body>

      </Card>

      {/* User Directory */}

      <AppCard>

        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>

            <h4 className="fw-bold mb-0">
              User Directory
            </h4>

            <small className="text-muted">
              Manage registered users
            </small>

          </div>

          <Badge
            bg="primary"
            className="fs-6 px-3 py-2"
          >
            Total:
            {" "}
            {users.length}
          </Badge>

        </div>

        {/* Search + Filter */}

        <Row className="g-3 mb-4">

          <Col md={8}>

            <Form.Control
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </Col>

          <Col md={4}>

            <Form.Select
              value={
                statusFilter
              }
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >
              <option value="all">
                All Users
              </option>

              <option value="active">
                Active Users
              </option>

              <option value="inactive">
                Inactive Users
              </option>

            </Form.Select>

          </Col>

        </Row>

        <UserTable
          users={filteredUsers}
          onActivate={
            handleActivate
          }
          onDeactivate={
            handleDeactivate
          }
        />

      </AppCard>

      <UserStatusModal
        show={showModal}
        onHide={() =>
          setShowModal(false)
        }
        onConfirm={
          confirmAction
        }
        actionType={
          actionType
        }
        username={
          selectedUser?.username
        }
      />
    </Container>
  );
}

export default UserManagement;