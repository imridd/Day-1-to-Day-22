
import { useState } from "react";

import {
  Container,
  Button,
  Card,
} from "react-bootstrap";

import { useNavigate } from "react-router";

import ProductForm from "../../components/product/ProductForm";

import AppNotification from "../../components/common/AppNotification";

import {
  getProducts,
  addProduct,
} from "../../services/productService";

function AddProduct() {
  const navigate = useNavigate();

  const [message, setMessage] =
    useState("");

  const [variant, setVariant] =
    useState("");

  const handleSave = async (
    product
  ) => {
    try {
      const products =
        await getProducts();

      const numericIds =
        products
          .map((p) =>
            Number(p.id)
          )
          .filter(
            (id) =>
              !isNaN(id)
          );

      const newId =
        numericIds.length > 0
          ? Math.max(
              ...numericIds
            ) + 1
          : 1;

      const newProduct = {
        ...product,
        id: newId,
      };

      await addProduct(
        newProduct
      );

      setVariant("success");

      setMessage(
        "Product added successfully ✅"
      );

    } catch (error) {

      console.log(error);

      setVariant("danger");

      setMessage(
        "Failed to add product ❌"
      );
    }
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
            Create Product 📦
          </h2>

          <p className="text-muted mb-0">
            Add new products to
            inventory and maintain
            stock information.
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

      {/* Notification */}

      <AppNotification
        message={message}
        variant={variant}
        setMessage={setMessage}
      />

      {/* Product Guidelines */}

      <Card className="glass-card border-0 mb-4">

        <Card.Body>

          <h5 className="fw-bold mb-3">
            Product Guidelines
          </h5>

          <ul className="mb-0 text-muted">

            <li>
              Product ID will be
              generated automatically.
            </li>

            <li>
              Select the correct
              category for reporting.
            </li>

            <li>
              Ensure pricing and
              quantity values are accurate.
            </li>

            <li>
              Verify product details
              before saving.
            </li>

          </ul>

        </Card.Body>

      </Card>

      {/* Success Section */}

      {variant === "success" &&
        message && (

        <Card className="glass-card border-0 mb-4">

          <Card.Body className="d-flex justify-content-between align-items-center flex-wrap gap-3">

            <div>

              <h6 className="fw-bold text-success mb-1">
                Product Added Successfully ✅
              </h6>

              <small className="text-muted">
                Review the product
                from the inventory list.
              </small>

            </div>

            <Button
              variant="success"
              onClick={() =>
                navigate(
                  "/products/list"
                )
              }
            >
              Open Product List
            </Button>

          </Card.Body>

        </Card>
      )}

      {/* Product Form */}

      <Card className="glass-card border-0">

        <Card.Header className="bg-transparent border-0">

          <h4 className="fw-bold mb-0">
            Product Information
          </h4>

        </Card.Header>

        <Card.Body>

          <ProductForm
            onSave={handleSave}
          />

        </Card.Body>

      </Card>

    </Container>
  );
}

export default AddProduct;