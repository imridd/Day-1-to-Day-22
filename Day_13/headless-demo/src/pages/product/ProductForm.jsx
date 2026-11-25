
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { Formik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Product name is required"),

  category: Yup.string()
    .required("Category is required"),

  price: Yup.number()
    .typeError("Price must be a number")
    .positive("Price must be greater than 0")
    .required("Price is required"),

  stock: Yup.number()
    .typeError("Stock must be a number")
    .min(0, "Stock cannot be negative")
    .required("Stock is required"),
});

function ProductForm({
  formData,
  handleSubmit,
}) {
  return (
    <Formik
      enableReinitialize
      initialValues={{
        name: formData?.name || "",
        category: formData?.category || "",
        price: formData?.price || "",
        stock: formData?.stock || "",
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
              placeholder="Product Name"
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
              name="category"
              placeholder="Category"
              value={values.category}
              onChange={handleChange}
              isInvalid={
                touched.category &&
                !!errors.category
              }
            />
            <Form.Control.Feedback type="invalid">
              {errors.category}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              name="price"
              type="number"
              placeholder="Price"
              value={values.price}
              onChange={handleChange}
              isInvalid={
                touched.price &&
                !!errors.price
              }
            />
            <Form.Control.Feedback type="invalid">
              {errors.price}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              name="stock"
              type="number"
              placeholder="Stock Quantity"
              value={values.stock}
              onChange={handleChange}
              isInvalid={
                touched.stock &&
                !!errors.stock
              }
            />
            <Form.Control.Feedback type="invalid">
              {errors.stock}
            </Form.Control.Feedback>
          </Form.Group>

          <Button
            type="submit"
            className="w-100"
          >
            {formData?.id
              ? "Update Product"
              : "Save Product"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}

export default ProductForm;