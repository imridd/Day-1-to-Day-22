
import { useEffect, useState } from "react";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
} from "react-bootstrap";

import { useNavigate } from "react-router";

import {
  getProducts,
} from "../../services/productService";

function ProductPage() {
  const navigate = useNavigate();

  const [products, setProducts] =
    useState([]);

  const [search,
    setSearch] =
    useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts =
    async () => {
      try {
        const data =
          await getProducts();

        setProducts(data);
      } catch (error) {
        console.log(error);
      }
    };

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
            Products 📦
          </h2>

          <p className="text mb-2">
            Manage inventory,
            categories and stock.
          </p>
        </div>

        <div className="d-flex gap-2">

          <Button
            variant="outline-primary"
            className="app-btn"
            onClick={() =>
              navigate(
                "/products/list"
              )
            }
          >
            View Products
          </Button>

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

        </div>

      </div>

      <Row className="mb-4">

        <Col md={12}>

          <Card className="glass-card border-0">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center flex-wrap">

                <div>

                  <h5 className="fw-bold mb-1">
                    Inventory Overview
                  </h5>

                  <p className="text-muted mb-0">

                    Track products,
                    categories and inventory
                    performance in one place.

                  </p>

                </div>

                <div className="d-flex gap-2 mt-2">
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() =>
                      navigate("/reports")
                    }
                  >
                    Reports
                  </Button>

                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>

      </Row>

      {/* KPI Cards */}

      <Row className="g-4 mb-4">

        <Col md={4}>
          <Card className="glass-card border-0 h-100">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small className="text-muted">
                    Total Products
                  </small>

                  <h2 className="fw-bold text-primary">
                    {products.length}
                  </h2>

                </div>

                <i className="bi bi-box-seam fs-1 text-primary"></i>

              </div>

            </Card.Body>

          </Card>
        </Col>

        <Col md={4}>
          <Card className="glass-card border-0 h-100">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small className="text-muted">
                    Categories
                  </small>

                  <h2 className="fw-bold text-success">
                    {totalCategories}
                  </h2>

                </div>

                <i className="bi bi-grid fs-1 text-success"></i>

              </div>

            </Card.Body>

          </Card>
        </Col>

        <Col md={4}>
          <Card className="glass-card border-0 h-100">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small className="text-muted">
                    Inventory Health
                  </small>

                  <h2 className="fw-bold text-warning">
                    100%
                  </h2>

                </div>

                <i className="bi bi-bar-chart fs-1 text-warning"></i>

              </div>

            </Card.Body>

          </Card>
        </Col>

      </Row>

      {/* Quick Actions */}

      <h4 className="fw-bold mb-3">
        Quick Actions
      </h4>

      <Row className="g-4">

        <Col md={6}>
          <Card className="glass-card border-0 h-100">

            <Card.Body>

              <div className="d-flex align-items-center gap-3 mb-3">

                <i className="bi bi-box-seam fs-1 text-primary"></i>

                <div>

                  <h5 className="fw-bold mb-1">
                    Product Directory
                  </h5>

                  <p className="text-muted mb-0">
                    View all products
                    and inventory details.
                  </p>

                </div>

              </div>

              <Button
                variant="primary"
                className="app-btn"
                onClick={() =>
                  navigate(
                    "/products/list"
                  )
                }
              >
                Open Directory
              </Button>

            </Card.Body>

          </Card>
        </Col>

        <Col md={6}>
          <Card className="glass-card border-0 h-100">

            <Card.Body>

              <div className="d-flex align-items-center gap-3 mb-3">

                <i className="bi bi-plus-circle fs-1 text-success"></i>

                <div>

                  <h5 className="fw-bold mb-1">
                    Create Product
                  </h5>

                  <p className="text-muted mb-0">
                    Register a new
                    product into inventory.
                  </p>

                </div>

              </div>

              <Button
                variant="success"
                className="app-btn"
                onClick={() =>
                  navigate(
                    "/products/add"
                  )
                }
              >
                Add Product
              </Button>

            </Card.Body>

          </Card>
        </Col>

      </Row>

      {/* Summary Section */}

      <Row className="mt-4">
        <Col>

          <Card className="glass-card border-0">

            <Card.Body>

              <h5 className="fw-bold">
                Product Summary
              </h5>

              <p className="text-muted mb-0">
                You currently have{" "}
                <strong>
                  {products.length}
                </strong>{" "}
                products spread across{" "}
                <strong>
                  {totalCategories}
                </strong>{" "}
                categories.
              </p>

            </Card.Body>

          </Card>

        </Col>
      </Row>

    </Container>
  );
}

export default ProductPage;