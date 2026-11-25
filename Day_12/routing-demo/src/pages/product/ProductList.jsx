
import { useEffect, useState } from "react";

import {
  Container,
  Card,
  Button,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";

import { useNavigate } from "react-router";

import ProductTable from "../../components/product/ProductTable";

import AppNotification from "../../components/common/AppNotification";

import {
  getProducts,
  deleteProduct,
} from "../../services/productService";

function ProductList() {
  const navigate = useNavigate();

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [variant, setVariant] =
    useState("");

  const loadProducts = async () => {
    try {
      const data =
        await getProducts();

      setProducts(data);
    } catch (error) {
      console.log(error);

      setVariant("danger");

      setMessage(
        "Failed to load products ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (
    id
  ) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this product?"
      );

    if (!confirmDelete) return;

    try {
      await deleteProduct(id);

      setProducts(
        products.filter(
          (product) =>
            product.id !== id
        )
      );

      setVariant("success");

      setMessage(
        "Product deleted successfully ✅"
      );
    } catch (error) {
      console.log(error);

      setVariant("danger");

      setMessage(
        "Failed to delete product ❌"
      );
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  if (loading) {
    return (
      <Container>
        <div className="text-center py-5">
          <Spinner
            animation="border"
            variant="primary"
          />

          <h5 className="mt-3">
            Loading Products...
          </h5>

          <p className="text-muted">
            Fetching inventory records.
          </p>
        </div>
      </Container>
    );
  }

  const totalCategories =
    [
      ...new Set(
        products.map(
          (product) =>
            product.category
        )
      ),
    ].length;

  return (
    <Container
      fluid
      className="py-4 px-4 fade-up"
    >
      {/* Header */}

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Product Directory 📦
          </h2>

          <p className="text-muted mb-0">
            View, manage and organize
            your products.
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

        </div>

      </div>

      {/* Notifications */}

      <AppNotification
        message={message}
        variant={variant}
        setMessage={setMessage}
      />

      {/* Stats */}

      <Row className="g-3 mb-4">

        <Col md={6}>
          <Card className="glass-card border-0 h-100">

            <Card.Body>

              <small className="text-muted">
                Products
              </small>

              <h3 className="fw-bold text-primary">
                {products.length}
              </h3>

            </Card.Body>

          </Card>
        </Col>

        <Col md={6}>
          <Card className="glass-card border-0 h-100">

            <Card.Body>

              <small className="text-muted">
                Categories
              </small>

              <h3 className="fw-bold text-success">
                {totalCategories}
              </h3>

            </Card.Body>

          </Card>
        </Col>

      </Row>

      {/* Table Section */}

      <Card className="glass-card border-0">

        <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center">

          <div>

            <h4 className="fw-bold mb-0">
              Product Directory
            </h4>

            <small className="text-muted">
              Manage all products
            </small>

          </div>

          <Button
            variant="primary"
            className="app-btn"
            onClick={() =>
              navigate(
                "/products/add"
              )
            }
          >
            + Add Product
          </Button>

        </Card.Header>

        <Card.Body>

          <ProductTable
            products={products}
            onDelete={handleDelete}
          />

        </Card.Body>

      </Card>
    </Container>
  );
}

export default ProductList;