import { useEffect, useState } from "react";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Badge,
  InputGroup,
} from "react-bootstrap";

import {
  useParams,
  useNavigate,
} from "react-router";

import {
  getProductById,
  updateProduct,
} from "../../services/productService";

import AppNotification from "../../components/common/AppNotification";

import {
  Formik,
  Form,
  Field,
  ErrorMessage,
} from "formik";

import * as Yup from "yup";

const ProductSchema = Yup.object({
  productName: Yup.string()
    .required("Product Name is required"),

  category: Yup.string()
    .required("Category is required"),

  price: Yup.number()
    .required("Price is required")
    .positive(
      "Price must be greater than 0"
    ),

  quantity: Yup.number()
    .required("Quantity is required")
    .positive(
      "Quantity must be greater than 0"
    ),
});

function ViewProduct() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [product, setProduct] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [variant, setVariant] =
    useState("");

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const data =
        await getProductById(id);

      setProduct(data);
    } catch (error) {
      console.log(error);

      setVariant("danger");

      setMessage(
        "Failed to load product ❌"
      );
    }
  };

  const handleUpdate = async (
    values
  ) => {
    try {
      const updatedProduct = {
        ...values,
        id: product.id,
      };

      await updateProduct(
        id,
        updatedProduct
      );

      setProduct(
        updatedProduct
      );

      setVariant("success");

      setMessage(
        "Product updated successfully ✅"
      );
    } catch (error) {
      console.log(error);

      setVariant("danger");

      setMessage(
        "Failed to update product ❌"
      );
    }
  };

  if (!product) {
    return (
      <Container>
        <div className="text-center py-5">
          <Spinner
            animation="border"
            variant="primary"
          />

          <h5 className="mt-3">
            Loading Product Details...
          </h5>
        </div>
      </Container>
    );
  }

  const initialFormValues = {
    productName:
      product.productName,

    category:
      product.category,

    price:
      product.price,

    quantity:
      product.quantity,
  };

  return (
    <Container
      fluid
      className="py-4 px-4 fade-up"
    >
      {/* Header */}

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Product Details 📦
          </h2>

          <p className="text-muted mb-0">
            View and manage
            inventory information.
          </p>
        </div>

        <div className="d-flex gap-2">

          <Button
            variant="outline-secondary"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Dashboard
          </Button>

          <Button
            variant="outline-primary"
            onClick={() =>
              navigate("/products")
            }
          >
            Product Home
          </Button>

          <Button
            variant="primary"
            onClick={() =>
              navigate("/products/list")
            }
          >
            Product List
          </Button>

        </div>

      </div>

      <AppNotification
        message={message}
        variant={variant}
        setMessage={setMessage}
      />

      {/* Product Summary */}

      <Card className="glass-card border-0 mb-4">

        <Card.Body>

          <div className="d-flex justify-content-between align-items-center flex-wrap">

            <div>

              <h3 className="fw-bold">
                {product.productName}
              </h3>

              <p className="text-muted mb-0">

                Product ID:
                {" "}
                #{product.id}

              </p>

            </div>

            <Badge
              bg="info"
              className="fs-6"
            >
              {product.category}
            </Badge>

          </div>

        </Card.Body>

      </Card>

      {/* Overview Cards */}

      <Row className="g-3 mb-4">

        <Col md={4}>

          <Card className="glass-card border-0">

            <Card.Body>

              <small className="text-muted">
                Category
              </small>

              <h5 className="fw-bold">
                {product.category}
              </h5>

            </Card.Body>

          </Card>

        </Col>

        <Col md={4}>

          <Card className="glass-card border-0">

            <Card.Body>

              <small className="text-muted">
                Price
              </small>

              <h5 className="fw-bold text-success">
                ₹
                {Number(
                  product.price
                ).toLocaleString()}
              </h5>

            </Card.Body>

          </Card>

        </Col>

        <Col md={4}>

          <Card className="glass-card border-0">

            <Card.Body>

              <small className="text-muted">
                Quantity
              </small>

              <h5 className="fw-bold">
                {product.quantity}
              </h5>

            </Card.Body>

          </Card>

        </Col>

      </Row>

      {/* Form */}

      <Formik
        enableReinitialize
        initialValues={
          initialFormValues
        }
        validationSchema={
          ProductSchema
        }
        onSubmit={
          handleUpdate
        }
      >
        {({
          resetForm,
          touched,
          errors,
        }) => (
          <Form>

            <Card className="glass-card border-0">

              <Card.Header className="bg-transparent border-0">

                <h4 className="fw-bold mb-0">
                  Edit Product
                </h4>

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
                        className={`form-control ${
                          touched.productName &&
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
                        name="category"
                        className={`form-control ${
                          touched.category &&
                          errors.category
                            ? "is-invalid"
                            : ""
                        }`}
                      />

                      <ErrorMessage
                        name="category"
                        component="div"
                        className="invalid-feedback"
                      />

                    </div>

                  </Col>

                </Row>

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
                          className={`form-control ${
                            touched.price &&
                            errors.price
                              ? "is-invalid"
                              : ""
                          }`}
                        />

                      </InputGroup>

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
                        className={`form-control ${
                          touched.quantity &&
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

              <Card.Footer className="bg-transparent border-0">

                <div className="d-flex justify-content-end gap-2">

                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() =>
                      resetForm()
                    }
                  >
                    Reset
                  </Button>

                  <Button
                    type="button"
                    variant="outline-danger"
                    onClick={() =>
                      navigate(
                        "/products/list"
                      )
                    }
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    className="app-btn"
                  >
                    Save Changes
                  </Button>

                </div>

              </Card.Footer>

            </Card>

          </Form>
        )}
      </Formik>

    </Container>
  );
}

export default ViewProduct;