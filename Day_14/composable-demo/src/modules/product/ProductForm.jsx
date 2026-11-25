
import { useEffect, useState } from "react";

import {
  Modal,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";

import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";

import {
  addProduct,
  editProduct,
} from "./productSlice";

import { useNotification } from "../../components/common/NotificationProvider";

const initialForm = {
  name: "",
  category: "",
  price: "",
  stock: "",
};

// YUP VALIDATION SCHEMA
const productValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Product name is required")
    .min(2, "Product name must contain at least 2 characters")
    .max(60, "Product name cannot exceed 60 characters"),

  category: Yup.string()
    .required("Please select a category")
    .oneOf(
      ["Electronics", "Accessories", "Fashion", "Home", "Other"],
      "Select a valid category"
    ),

  price: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .typeError("Price must be a valid number")
    .required("Price is required")
    .min(0, "Price cannot be negative"),

  stock: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .typeError("Stock must be a valid number")
    .required("Stock quantity is required")
    .integer("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
});

function ProductForm({ show, onHide, product }) {
  const dispatch = useDispatch();
  const { notify } = useNotification();

  const { saving } = useSelector((state) => state.products);

  const [error, setError] = useState("");

  const isEditing = Boolean(product);

  const formik = useFormik({
    initialValues: product
      ? {
          name: product.name || "",
          category: product.category || "",
          price: product.price ?? "",
          stock: product.stock ?? "",
        }
      : initialForm,

    enableReinitialize: true,

    validationSchema: productValidationSchema,

    onSubmit: async (values, { setSubmitting }) => {
      setError("");

      const price = Number(values.price);
      const stock = Number(values.stock);

      const productData = {
        name: values.name.trim(),
        category: values.category,
        price,
        stock,
        status: stock > 0 ? "Available" : "Out of Stock",
      };

      try {
        if (isEditing) {
          await dispatch(
            editProduct({
              id: product.id,
              productData,
            })
          ).unwrap();

          notify("Product updated successfully! ✨", "success");
        } else {
          await dispatch(addProduct(productData)).unwrap();

          notify("New product added successfully! 🎉", "success");
        }

        formik.resetForm();
        onHide();
      } catch (err) {
        const message =
          typeof err === "string"
            ? err
            : "Something went wrong. Please try again.";

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
        values: product
          ? {
              name: product.name || "",
              category: product.category || "",
              price: product.price ?? "",
              stock: product.stock ?? "",
            }
          : { ...initialForm },
      });
    }
  }, [show, product]);

  const isInvalid = (field) =>
    Boolean(formik.touched[field] && formik.errors[field]);

  return (
    <Modal
      show={show}
      onHide={saving || formik.isSubmitting ? undefined : onHide}
      centered
      backdrop={saving || formik.isSubmitting ? "static" : true}
    >
      <Form onSubmit={formik.handleSubmit} noValidate>
        <Modal.Header closeButton={!saving && !formik.isSubmitting}>
          <Modal.Title>
            {isEditing ? "✏️ Edit Product" : "✨ Add New Product"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {/* PRODUCT NAME */}
          <Form.Group className="mb-3">
            <Form.Label>Product Name</Form.Label>

            <Form.Control
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter product name"
              isInvalid={isInvalid("name")}
            />

            <Form.Control.Feedback type="invalid">
              {formik.errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          {/* CATEGORY */}
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>

            <Form.Select
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={isInvalid("category")}
            >
              <option value="">Select category</option>
              <option value="Electronics">Electronics</option>
              <option value="Accessories">Accessories</option>
              <option value="Fashion">Fashion</option>
              <option value="Home">Home</option>
              <option value="Other">Other</option>
            </Form.Select>

            <Form.Control.Feedback type="invalid">
              {formik.errors.category}
            </Form.Control.Feedback>
          </Form.Group>

          {/* PRICE */}
          <Form.Group className="mb-3">
            <Form.Label>Price (₹)</Form.Label>

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

          {/* STOCK */}
          <Form.Group className="mb-3">
            <Form.Label>Available Stock</Form.Label>

            <Form.Control
              type="number"
              name="stock"
              value={formik.values.stock}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter stock quantity"
              min="0"
              step="1"
              isInvalid={isInvalid("stock")}
            />

            <Form.Control.Feedback type="invalid">
              {formik.errors.stock}
            </Form.Control.Feedback>
          </Form.Group>

          <Alert variant="light" className="mb-0">
            <small>
              💡 Product status is automatically set based on stock quantity.
            </small>
          </Alert>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            type="button"
            onClick={onHide}
            disabled={saving || formik.isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="dark"
            disabled={saving || formik.isSubmitting}
          >
            {saving || formik.isSubmitting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Saving...
              </>
            ) : isEditing ? (
              "Update Product"
            ) : (
              "Add Product"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ProductForm;
