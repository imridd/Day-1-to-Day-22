
import {
  Formik,
  Form,
  Field,
  ErrorMessage,
} from "formik";
import { useState, useEffect } from "react";
import * as Yup from "yup";
import {
  getCategories,
  addCategory,
} from "../../services/categoryService";

import useAuth from "../../hooks/useAuth";

import {
  Card,
  Row,
  Col,
  Button,
  InputGroup,
} from "react-bootstrap";

const ProductSchema = Yup.object({
  productName: Yup.string()
    .trim()
    .required("Product Name is required")
    .min(
      3,
      "Minimum 3 characters required"
    )
    .max(
      50,
      "Maximum 50 characters allowed"
    )
    .matches(
      /^[A-Za-z0-9 ]+$/,
      "Only letters, numbers and spaces allowed"
    ),

  category: Yup.string()
    .required(
      "Category is required"
    ),

  price: Yup.number()
    .typeError(
      "Price must be numeric"
    )
    .required("Price is required")
    .positive(
      "Price must be greater than 0"
    )
    .min(
      1,
      "Minimum price is ₹1"
    )
    .max(
      1000000,
      "Maximum price is ₹10,00,000"
    ),

  quantity: Yup.number()
    .typeError(
      "Quantity must be numeric"
    )
    .required(
      "Quantity is required"
    )
    .integer(
      "Quantity must be a whole number"
    )
    .min(
      1,
      "Minimum quantity is 1"
    )
    .max(
      10000,
      "Maximum quantity is 10,000"
    ),
});

function ProductForm({ onSave }) {
  const { role } =
    useAuth();
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories =
    async () => {

      try {

        const data =
          await getCategories();

        setCategories(data);

      } catch (error) {

        console.log(error);

      }
    };

  const handleAddCategory =
    async () => {

      if (
        !newCategory.trim()
      ) {
        return;
      }

      try {

        await addCategory(
          newCategory.trim()
        );

        setNewCategory("");

        loadCategories();

      } catch (error) {

        console.log(error);

      }
    };

  return (
    <Formik
      initialValues={{
        productName: "",
        category: "",
        price: "",
        quantity: "",
      }}
      validationSchema={
        ProductSchema
      }
      onSubmit={(
        values,
        {
          resetForm,
        }
      ) => {
        onSave(values);

        resetForm();
      }}
    >
      {({
        touched,
        errors,
        resetForm,
        setFieldValue,
      }) => (
        <Form>

          {/* Product Information */}

          <Card className="glass-card border-0 mb-4">

            <Card.Header className="bg-transparent border-0">

              <h5 className="fw-bold mb-0">
                Product Information
              </h5>

            </Card.Header>

            <Card.Body>

              <Row>

                <Col md={6}>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">

                      Product Name

                    </label>

                    <Field
                      name="productName"
                      placeholder="Enter Product Name"
                      className={`form-control ${touched.productName &&
                        errors.productName
                        ? "is-invalid"
                        : ""
                        }`}
                    />

                    <ErrorMessage
                      name="productName"
                      component="div"
                      className="invalid-feedback"
                    />

                  </div>

                </Col>
                <Col md={6}>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Category
                    </label>

                    <Field
                      as="select"
                      name="category"
                      className={`form-select ${touched.category &&
                          errors.category
                          ? "is-invalid"
                          : ""
                        }`}
                    >

                      <option value="">
                        Select Category
                      </option>

                      {categories.map(
                        (category) => (
                          <option
                            key={category.id}
                            value={category.name}
                          >
                            {category.name}
                          </option>
                        )
                      )}

                    </Field>

                    <ErrorMessage
                      name="category"
                      component="div"
                      className="invalid-feedback"
                    />

                  </div>

                  {role === "admin" && (

                    <Button
                      type="button"
                      variant="link"
                      className="
      p-0
      text-decoration-none
      fw-semibold
      "
                      onClick={async () => {

                        const categoryName =
                          prompt(
                            "Enter Category Name"
                          );

                        if (
                          !categoryName ||
                          !categoryName.trim()
                        ) {
                          return;
                        }

                        try {

                          await addCategory(
                            categoryName.trim()
                          );

                          await loadCategories();

                          setFieldValue(
                            "category",
                            categoryName.trim()
                          );

                        } catch (error) {

                          console.log(error);

                        }

                      }}
                    >
                      ➕ Add Category
                    </Button>

                  )}

                </Col>

              </Row>

            </Card.Body>

          </Card>

          {/* Inventory Information */}

          <Card className="glass-card border-0 mb-4">

            <Card.Header className="bg-transparent border-0">

              <h5 className="fw-bold mb-0">
                Inventory Information
              </h5>

            </Card.Header>

            <Card.Body>

              <Row>

                <Col md={6}>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">

                      Price

                    </label>

                    <InputGroup>

                      <InputGroup.Text>
                        ₹
                      </InputGroup.Text>

                      <Field
                        type="number"
                        name="price"
                        placeholder="Enter Price"
                        className={`form-control ${touched.price &&
                          errors.price
                          ? "is-invalid"
                          : ""
                          }`}
                      />

                    </InputGroup>

                    <ErrorMessage
                      name="price"
                      component="div"
                      className="text-danger small mt-1"
                    />

                  </div>

                </Col>

                <Col md={6}>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">

                      Quantity

                    </label>

                    <Field
                      type="number"
                      name="quantity"
                      placeholder="Enter Quantity"
                      className={`form-control ${touched.quantity &&
                        errors.quantity
                        ? "is-invalid"
                        : ""
                        }`}
                    />

                    <ErrorMessage
                      name="quantity"
                      component="div"
                      className="invalid-feedback"
                    />

                  </div>

                </Col>

              </Row>

            </Card.Body>

          </Card>

          {/* Actions */}

          <Card className="glass-card border-0">

            <Card.Body>

              <div className="d-flex justify-content-end gap-2">

                <Button
                  type="button"
                  variant="outline-secondary"
                  className="app-btn"
                  onClick={() => {

                    const confirmReset =
                      window.confirm(
                        "Clear all fields?"
                      );

                    if (
                      confirmReset
                    ) {
                      resetForm();
                    }

                  }}
                >
                  Reset
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  className="app-btn"
                >
                  Save Product
                </Button>

              </div>

            </Card.Body>

          </Card>

        </Form>
      )}
    </Formik>
  );
}

export default ProductForm;
