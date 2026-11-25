
import { useEffect, useState } from "react";

import {
  Modal,
  Form,
  Button,
  Alert,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";

import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";

import {
  addCourse,
  editCourse,
} from "./courseSlice";

import { useNotification } from "../../components/common/NotificationProvider";

// Initial form values
const initialForm = {
  name: "",
  trainer: "",
  category: "",
  duration: "",
  price: "",
  status: "Active",
};

// YUP VALIDATION SCHEMA
const courseValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Course name is required")
    .min(3, "Course name must contain at least 3 characters")
    .max(60, "Course name cannot exceed 60 characters"),

  trainer: Yup.string()
    .trim()
    .required("Trainer name is required")
    .min(2, "Trainer name must contain at least 2 characters")
    .max(50, "Trainer name cannot exceed 50 characters"),

  category: Yup.string()
    .required("Please select a category")
    .oneOf(
      ["Development", "Design", "Business", "Data Science", "Other"],
      "Select a valid category"
    ),

  duration: Yup.string()
    .trim()
    .required("Course duration is required")
    .min(2, "Enter a valid course duration")
    .max(30, "Duration cannot exceed 30 characters"),

  price: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .typeError("Price must be a valid number")
    .required("Course price is required")
    .min(0, "Price cannot be negative"),

  status: Yup.string()
    .required("Please select a status")
    .oneOf(
      ["Active", "Inactive"],
      "Select a valid status"
    ),
});

function CourseForm({ show, onHide, course }) {
  const dispatch = useDispatch();
  const { notify } = useNotification();

  const { saving } = useSelector(
    (state) => state.courses
  );

  const [error, setError] = useState("");

  const isEditing = Boolean(course);

  const getFormValues = () => {
    if (!course) {
      return { ...initialForm };
    }

    return {
      name: course.name || "",
      trainer: course.trainer || "",
      category: course.category || "",
      duration: course.duration || "",
      price: course.price ?? "",
      status: course.status || "Active",
    };
  };

  const formik = useFormik({
    initialValues: getFormValues(),

    enableReinitialize: true,

    validationSchema: courseValidationSchema,

    onSubmit: async (values, { setSubmitting }) => {
      setError("");

      const courseData = {
        name: values.name.trim(),
        trainer: values.trainer.trim(),
        category: values.category,
        duration: values.duration.trim(),
        price: Number(values.price),
        status: values.status,
      };

      try {
        if (isEditing) {
          await dispatch(
            editCourse({
              id: course.id,
              courseData,
            })
          ).unwrap();

          notify(
            "Course updated successfully! ✨",
            "success"
          );
        } else {
          await dispatch(
            addCourse(courseData)
          ).unwrap();

          notify(
            "New course added successfully! 🎉",
            "success"
          );
        }

        formik.resetForm();
        onHide();
      } catch (err) {
        const message =
          typeof err === "string"
            ? err
            : "Unable to save course. Please try again.";

        setError(message);
        notify(message, "danger");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Reset the form whenever the modal opens
  useEffect(() => {
    if (show) {
      setError("");

      formik.resetForm({
        values: getFormValues(),
      });
    }
  }, [show, course]);

  // Check whether a field has a validation error
  const isInvalid = (field) =>
    Boolean(
      formik.touched[field] &&
      formik.errors[field]
    );

  const isSaving = saving || formik.isSubmitting;

  return (
    <Modal
      show={show}
      onHide={isSaving ? undefined : onHide}
      centered
      backdrop={isSaving ? "static" : true}
    >
      <Form onSubmit={formik.handleSubmit} noValidate>

        {/* HEADER */}
        <Modal.Header
          closeButton={!isSaving}
          className="border-0"
        >
          <Modal.Title className="fw-bold">
            {isEditing
              ? "✏️ Edit Course"
              : "✨ Add New Course"}
          </Modal.Title>
        </Modal.Header>

        {/* BODY */}
        <Modal.Body className="px-4">

          <p className="text-secondary mb-4">
            {isEditing
              ? "Update your course information."
              : "Create a new learning program for your catalogue."}
          </p>

          {error && (
            <Alert variant="danger">
              {error}
            </Alert>
          )}

          {/* COURSE NAME */}
          <Form.Group className="mb-3">
            <Form.Label>Course Name</Form.Label>

            <Form.Control
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g. React Fundamentals"
              isInvalid={isInvalid("name")}
            />

            <Form.Control.Feedback type="invalid">
              {formik.errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          {/* TRAINER NAME */}
          <Form.Group className="mb-3">
            <Form.Label>Trainer Name</Form.Label>

            <Form.Control
              name="trainer"
              value={formik.values.trainer}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter trainer name"
              isInvalid={isInvalid("trainer")}
            />

            <Form.Control.Feedback type="invalid">
              {formik.errors.trainer}
            </Form.Control.Feedback>
          </Form.Group>

          <Row>
            {/* CATEGORY */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>

                <Form.Select
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={isInvalid("category")}
                >
                  <option value="">
                    Select category
                  </option>

                  <option value="Development">
                    Development
                  </option>

                  <option value="Design">
                    Design
                  </option>

                  <option value="Business">
                    Business
                  </option>

                  <option value="Data Science">
                    Data Science
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </Form.Select>

                <Form.Control.Feedback type="invalid">
                  {formik.errors.category}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* DURATION */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Duration</Form.Label>

                <Form.Control
                  name="duration"
                  value={formik.values.duration}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g. 6 Weeks"
                  isInvalid={isInvalid("duration")}
                />

                <Form.Control.Feedback type="invalid">
                  {formik.errors.duration}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            {/* PRICE */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Course Price (₹)</Form.Label>

                <Form.Control
                  type="number"
                  name="price"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  isInvalid={isInvalid("price")}
                />

                <Form.Control.Feedback type="invalid">
                  {formik.errors.price}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* STATUS */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>

                <Form.Select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={isInvalid("status")}
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </Form.Select>

                <Form.Control.Feedback type="invalid">
                  {formik.errors.status}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Alert variant="light" className="mb-0">
            <small>
              💡 All course details are stored in your course catalogue.
            </small>
          </Alert>

        </Modal.Body>

        {/* FOOTER */}
        <Modal.Footer className="border-0 px-4 pb-4">

          <Button
            variant="outline-secondary"
            type="button"
            onClick={onHide}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="dark"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Spinner
                  size="sm"
                  className="me-2"
                />
                Saving...
              </>
            ) : isEditing ? (
              "Update Course"
            ) : (
              "Add Course"
            )}
          </Button>

        </Modal.Footer>

      </Form>
    </Modal>
  );
}

export default CourseForm;
