
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { Formik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Employee name is required"),

  email: Yup.string()
    .email("Invalid email")
    .required("Email is required"),

  department: Yup.string()
    .required("Department is required"),

  designation: Yup.string()
    .required("Designation is required"),

  salary: Yup.number()
    .positive("Salary must be positive")
    .required("Salary is required"),

  joiningDate: Yup.string()
    .required("Joining date is required"),
});

function EmployeeForm({
  formData,
  handleSubmit,
}) {
  return (
    <Formik
      enableReinitialize
      initialValues={{
        name: formData?.name || "",
        email: formData?.email || "",
        department:
          formData?.department || "",
        designation:
          formData?.designation || "",
        salary:
          formData?.salary || "",
        joiningDate:
          formData?.joiningDate || "",
      }}
      validationSchema={
        validationSchema
      }
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
              placeholder="Employee Name"
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
              name="email"
              type="email"
              placeholder="Email"
              value={values.email}
              onChange={handleChange}
              isInvalid={
                touched.email &&
                !!errors.email
              }
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              name="department"
              placeholder="Department"
              value={values.department}
              onChange={handleChange}
              isInvalid={
                touched.department &&
                !!errors.department
              }
            />
            <Form.Control.Feedback type="invalid">
              {errors.department}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              name="designation"
              placeholder="Designation"
              value={values.designation}
              onChange={handleChange}
              isInvalid={
                touched.designation &&
                !!errors.designation
              }
            />
            <Form.Control.Feedback type="invalid">
              {errors.designation}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              name="salary"
              type="number"
              placeholder="Salary"
              value={values.salary}
              onChange={handleChange}
              isInvalid={
                touched.salary &&
                !!errors.salary
              }
            />
            <Form.Control.Feedback type="invalid">
              {errors.salary}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              name="joiningDate"
              type="date"
              value={values.joiningDate}
              onChange={handleChange}
              isInvalid={
                touched.joiningDate &&
                !!errors.joiningDate
              }
            />
            <Form.Control.Feedback type="invalid">
              {errors.joiningDate}
            </Form.Control.Feedback>
          </Form.Group>

          <Button
            type="submit"
            className="w-100"
          >
            {formData?.id
              ? "Update Employee"
              : "Save Employee"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}

export default EmployeeForm;