import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { Formik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Course name is required"),

  trainer: Yup.string()
    .required("Trainer name is required"),

  duration: Yup.number()
    .typeError("Duration must be a number")
    .positive("Duration must be greater than 0")
    .required("Duration is required"),

  fee: Yup.number()
    .typeError("Fee must be a number")
    .positive("Fee must be greater than 0")
    .required("Fee is required"),

  enrolledStudents: Yup.number()
    .typeError("Students must be a number")
    .min(0, "Students cannot be negative")
    .required("Students count is required"),
});

function CourseForm({
  formData,
  handleSubmit,
}) {
  return (
    <Formik
      enableReinitialize
      initialValues={{
        name: formData?.name || "",
        trainer:
          formData?.trainer || "",
        duration:
          formData?.duration || "",
        fee:
          formData?.fee || "",
        enrolledStudents:
          formData?.enrolledStudents || "",
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        handleSubmit(values);
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleSubmit,
      }) => (
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Control
              name="name"
              placeholder="Course Name"
              value={values.name}
              onChange={handleChange}
              isInvalid={
                touched.name &&
                !!errors.name
              }
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              name="trainer"
              placeholder="Trainer"
              value={values.trainer}
              onChange={handleChange}
              isInvalid={
                touched.trainer &&
                !!errors.trainer
              }
            />
            <Form.Control.Feedback type="invalid">
              {errors.trainer}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              name="duration"
              type="number"
              placeholder="Duration (Months)"
              value={values.duration}
              onChange={handleChange}
              isInvalid={
                touched.duration &&
                !!errors.duration
              }
            />
            <Form.Control.Feedback type="invalid">
              {errors.duration}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              name="fee"
              type="number"
              placeholder="Fee"
              value={values.fee}
              onChange={handleChange}
              isInvalid={
                touched.fee &&
                !!errors.fee
              }
            />
            <Form.Control.Feedback type="invalid">
              {errors.fee}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              name="enrolledStudents"
              type="number"
              placeholder="Enrolled Students"
              value={
                values.enrolledStudents
              }
              onChange={handleChange}
              isInvalid={
                touched.enrolledStudents &&
                !!errors.enrolledStudents
              }
            />
            <Form.Control.Feedback type="invalid">
              {errors.enrolledStudents}
            </Form.Control.Feedback>
          </Form.Group>

          <Button
            type="submit"
            className="w-100"
          >
            {formData?.id
              ? "Update Course"
              : "Save Course"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}

export default CourseForm;