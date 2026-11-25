
import { useEffect, useMemo, useState } from "react";

import {
  Card,
  Table,
  Badge,
  Form,
  InputGroup,
  Button,
  Spinner,
  Alert,
  Modal,
  Row,
  Col,
} from "react-bootstrap";

import { useDispatch, useSelector } from "react-redux";

import {
  fetchCourses,
  removeCourse,
} from "./courseSlice";

import CourseForm from "./CourseForm";

import { useNotification } from "../../components/common/NotificationProvider";

function CourseTable() {
  const dispatch = useDispatch();
  const { notify } = useNotification();

  const { courses, loading, error } = useSelector(
    (state) => state.courses
  );

  // Local UI states
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch courses
  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  // Get unique categories
  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(courses.map((course) => course.category)),
    ];
  }, [courses]);

  // Search and filter courses
  const filteredCourses = useMemo(() => {
    const searchValue = search.toLowerCase();

    return courses.filter((course) => {
      const matchesSearch = [
        course.name,
        course.trainer,
        course.category,
        course.duration,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(searchValue)
      );

      const matchesCategory =
        categoryFilter === "All" ||
        course.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" ||
        course.status === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [courses, search, categoryFilter, statusFilter]);

  // Add course
  const handleAdd = () => {
    setSelectedCourse(null);
    setShowForm(true);
  };

  // Edit course
  const handleEdit = (course) => {
    setSelectedCourse(course);
    setShowForm(true);
  };

  // Open delete confirmation
  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    setDeleting(true);

    try {
      await dispatch(
        removeCourse(courseToDelete.id)
      ).unwrap();

      notify(
        `${courseToDelete.name} deleted successfully!`,
        "success"
      );

      setShowDeleteModal(false);
      setCourseToDelete(null);
    } catch (err) {
      notify(
        typeof err === "string"
          ? err
          : "Unable to delete course.",
        "danger"
      );
    } finally {
      setDeleting(false);
    }
  };

  // Retry fetching courses
  const handleRetry = async () => {
    try {
      await dispatch(fetchCourses()).unwrap();

      notify(
        "Courses loaded successfully!",
        "success"
      );
    } catch {
      notify(
        "Unable to load courses.",
        "danger"
      );
    }
  };

  return (
    <>
      <Card className="product-table-card border-0 shadow-sm rounded-4">
        <Card.Body className="p-4">

          {/* Header */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">

            <div>
              <h5 className="fw-bold mb-1">
                📚 Course Catalogue
              </h5>

              <p className="text-secondary small mb-0">
                Manage your courses, trainers and learning programs
              </p>
            </div>

            <Button
              variant="dark"
              className="rounded-pill px-4"
              onClick={handleAdd}
            >
              + Add Course
            </Button>

          </div>

          {/* Search and filters */}
          <Row className="g-3 mb-4">

            <Col md={6}>
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0">
                  🔍
                </InputGroup.Text>

                <Form.Control
                  className="bg-light border-start-0"
                  placeholder="Search courses, trainers..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </InputGroup>
            </Col>

            <Col md={3}>
              <Form.Select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
                className="bg-light"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "All"
                      ? "All Categories"
                      : category}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="bg-light"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Form.Select>
            </Col>

          </Row>

          {/* Error message */}
          {error && (
            <Alert variant="danger">
              {error}

              <Button
                size="sm"
                variant="outline-danger"
                className="ms-3"
                onClick={handleRetry}
              >
                Retry
              </Button>
            </Alert>
          )}

          {/* Loading */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />

              <p className="text-secondary mt-2 mb-0">
                Loading courses...
              </p>
            </div>
          ) : !error ? (

            /* Course table */
            <div className="table-responsive">

              <Table
                hover
                className="product-table align-middle mb-0"
              >

                <thead>
                  <tr>
                    <th>COURSE</th>
                    <th>TRAINER</th>
                    <th>CATEGORY</th>
                    <th>DURATION</th>
                    <th>PRICE</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredCourses.length > 0 ? (

                    filteredCourses.map((course) => (

                      <tr key={course.id}>

                        {/* Course */}
                        <td>
                          <div className="fw-semibold">
                            {course.name}
                          </div>

                          <small className="text-secondary">
                            ID: {course.id}
                          </small>
                        </td>

                        {/* Trainer */}
                        <td>
                          {course.trainer}
                        </td>

                        {/* Category */}
                        <td>
                          <Badge
                            bg="light"
                            text="dark"
                            className="rounded-pill px-3 py-2"
                          >
                            {course.category}
                          </Badge>
                        </td>

                        {/* Duration */}
                        <td>
                          {course.duration}
                        </td>

                        {/* Price */}
                        <td className="fw-semibold">
                          ₹{Number(course.price).toLocaleString("en-IN")}
                        </td>

                        {/* Status */}
                        <td>
                          <Badge
                            bg={
                              course.status === "Active"
                                ? "success"
                                : "secondary"
                            }
                            pill
                          >
                            {course.status}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="d-flex gap-2">

                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() =>
                                handleEdit(course)
                              }
                            >
                              Edit
                            </Button>

                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() =>
                                handleDeleteClick(course)
                              }
                            >
                              Delete
                            </Button>

                          </div>
                        </td>

                      </tr>

                    ))

                  ) : (

                    <tr>
                      <td
                        colSpan={7}
                        className="text-center text-secondary py-5"
                      >
                        {search ||
                        categoryFilter !== "All" ||
                        statusFilter !== "All"
                          ? "No matching courses found 🔍"
                          : "No courses available. Add your first course! ✨"}
                      </td>
                    </tr>

                  )}

                </tbody>

              </Table>

            </div>

          ) : null}

          {/* Result count */}
          {!loading && !error && (
            <div className="text-secondary small mt-3">
              Showing {filteredCourses.length} of {courses.length} courses
            </div>
          )}

        </Card.Body>
      </Card>

      {/* Add / Edit Course Modal */}
      <CourseForm
        show={showForm}
        onHide={() => {
          setShowForm(false);
          setSelectedCourse(null);
        }}
        course={selectedCourse}
      />

      {/* Delete confirmation modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => {
          if (!deleting) {
            setShowDeleteModal(false);
            setCourseToDelete(null);
          }
        }}
        centered
      >

        <Modal.Header closeButton={!deleting}>
          <Modal.Title>
            🗑️ Delete Course?
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to delete{" "}
          <strong>{courseToDelete?.name}</strong>?

          This action cannot be undone.
        </Modal.Body>

        <Modal.Footer>

          <Button
            variant="light"
            disabled={deleting}
            onClick={() => {
              setShowDeleteModal(false);
              setCourseToDelete(null);
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

export default CourseTable;
