
import { useEffect, useState } from "react";

import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Spinner,
} from "react-bootstrap";

import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";

import { addEmployee, editEmployee } from "./employeeSlice";

import { useNotification } from "../../components/common/NotificationProvider";

const initialForm = {
  name: "",
  email: "",
  department: "",
  role: "",
  status: "Active",
};

// YUP VALIDATION SCHEMA
const employeeValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Full name is required")
    .min(3, "Name must contain at least 3 characters")
    .max(50, "Name cannot exceed 50 characters"),

  email: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Email address is required"),

  department: Yup.string()
    .required("Please select a department")
    .oneOf(
      ["Engineering", "Design", "Marketing", "HR", "Finance"],
      "Select a valid department"
    ),

  role: Yup.string()
    .trim()
    .required("Designation is required")
    .min(2, "Designation must contain at least 2 characters")
    .max(50, "Designation cannot exceed 50 characters"),

  status: Yup.string()
    .required("Please select a status")
    .oneOf(
      ["Active", "On Leave", "Inactive"],
      "Select a valid status"
    ),
});

function EmployeeForm({ show, onHide, employee }) {
  const dispatch = useDispatch();
  const { notify } = useNotification();

  const [error, setError] = useState("");

  const isEditing = Boolean(employee);

  const formik = useFormik({
    initialValues: employee
      ? {
          name: employee.name || "",
          email: employee.email || "",
          department: employee.department || "",
          role: employee.role || "",
          status: employee.status || "Active",
        }
      : initialForm,

    enableReinitialize: true,

    validationSchema: employeeValidationSchema,

    onSubmit: async (values, { setSubmitting }) => {
      setError("");

      const employeeData = {
        name: values.name.trim(),
        email: values.email.trim(),
        department: values.department,
        role: values.role.trim(),
        status: values.status,
      };

      try {
        if (isEditing) {
          await dispatch(
            editEmployee({
              id: employee.id,
              employeeData,
            })
          ).unwrap();

          notify("Employee updated successfully! ✨", "success");
        } else {
          await dispatch(addEmployee(employeeData)).unwrap();

          notify("New employee added successfully! 🎉", "success");
        }

        formik.resetForm();
        onHide();
      } catch (err) {
        const message =
          typeof err === "string"
            ? err
            : "Unable to save employee. Please try again.";

        setError(message);
        notify(message, "danger");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (show) {
      setError("");

      formik.resetForm({
        values: employee
          ? {
              name: employee.name || "",
              email: employee.email || "",
              department: employee.department || "",
              role: employee.role || "",
              status: employee.status || "Active",
            }
          : { ...initialForm },
      });
    }
  }, [show, employee]);

  const isInvalid = (field) =>
    Boolean(formik.touched[field] && formik.errors[field]);

  return (
    <Modal
      show={show}
      onHide={formik.isSubmitting ? undefined : onHide}
      centered
      backdrop={formik.isSubmitting ? "static" : true}
    >
      <Modal.Header closeButton={!formik.isSubmitting} className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          {isEditing ? "Edit Employee ✏️" : "Add New Employee ✨"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <p className="text-secondary">
          {isEditing
            ? "Update your team member's details."
            : "Add a new member to your awesome team."}
        </p>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={formik.handleSubmit} noValidate>
          {/* NAME */}
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>

            <Form.Control
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter employee name"
              isInvalid={isInvalid("name")}
            />

            <Form.Control.Feedback type="invalid">
              {formik.errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          {/* EMAIL */}
          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>

            <Form.Control
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="name@example.com"
              isInvalid={isInvalid("email")}
            />

            <Form.Control.Feedback type="invalid">
              {formik.errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Row>
            {/* DEPARTMENT */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Department</Form.Label>

                <Form.Select
                  name="department"
                  value={formik.values.department}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={isInvalid("department")}
                >
                  <option value="">Select department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                </Form.Select>

                <Form.Control.Feedback type="invalid">
                  {formik.errors.department}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* DESIGNATION */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Designation</Form.Label>

                <Form.Control
                  name="role"
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter designation"
                  isInvalid={isInvalid("role")}
                />

                <Form.Control.Feedback type="invalid">
                  {formik.errors.role}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* STATUS */}
          <Form.Group className="mb-4">
            <Form.Label>Status</Form.Label>

            <Form.Select
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={isInvalid("status")}
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </Form.Select>

            <Form.Control.Feedback type="invalid">
              {formik.errors.status}
            </Form.Control.Feedback>
          </Form.Group>

          {/* BUTTONS */}
          <div className="d-flex justify-content-end gap-2">
            <Button
              variant="light"
              type="button"
              onClick={onHide}
              disabled={formik.isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Add Employee"
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default EmployeeForm;
