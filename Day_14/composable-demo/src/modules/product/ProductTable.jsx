
import { useState, useMemo } from "react";

import {
  Card,
  Table,
  Badge,
  Form,
  InputGroup,
  Button,
  Spinner,
  Alert,
  Modal,
} from "react-bootstrap";

import { useDispatch, useSelector } from "react-redux";

import {
  fetchProducts,
  removeProduct,
} from "./productSlice";

import ProductForm from "./ProductForm";
import { useNotification } from "../../components/common/NotificationProvider";

function ProductTable() {
  const dispatch = useDispatch();
  const { notify } = useNotification();

  const { products, loading, error } = useSelector(
    (state) => state.products
  );

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filteredProducts = useMemo(() => {
    const searchValue = search.toLowerCase();

    return products.filter((product) =>
      [product.name, product.category, product.status].some((value) =>
        String(value || "").toLowerCase().includes(searchValue)
      )
    );
  }, [products, search]);

  const handleAdd = () => {
    setSelectedProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    setDeleting(true);

    try {
      await dispatch(removeProduct(productToDelete.id)).unwrap();

      notify(
        `${productToDelete.name} deleted successfully!`,
        "success"
      );

      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      notify(
        typeof err === "string" ? err : "Unable to delete product.",
        "danger"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleRetry = async () => {
    try {
      await dispatch(fetchProducts()).unwrap();
      notify("Products loaded successfully!", "success");
    } catch {
      notify("Unable to load products.", "danger");
    }
  };

  return (
    <>
      <Card className="product-table-card border-0 shadow-sm rounded-4">
        <Card.Body className="p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h5 className="fw-bold mb-1">
                🛍️ Product Catalogue
              </h5>
              <p className="text-secondary small mb-0">
                Manage your products and inventory
              </p>
            </div>

            <Button
              variant="dark"
              className="rounded-pill px-4"
              onClick={handleAdd}
            >
              + Add Product
            </Button>
          </div>

          <InputGroup className="mb-4">
            <InputGroup.Text className="bg-light border-end-0">
              🔍
            </InputGroup.Text>

            <Form.Control
              className="bg-light border-start-0"
              placeholder="Search products, categories..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </InputGroup>

          {error && (
            <Alert variant="danger">
              {error}

              <Button
                size="sm"
                variant="outline-danger"
                className="ms-3"
                onClick={handleRetry}
              >
                Retry
              </Button>
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="text-secondary mt-2 mb-0">
                Loading products...
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="product-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>CATEGORY</th>
                    <th>PRICE</th>
                    <th>STOCK</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                      const inStock = Number(product.stock) > 0;

                      return (
                        <tr key={product.id}>
                          <td>
                            <div className="fw-semibold">
                              {product.name}
                            </div>
                            <small className="text-secondary">
                              ID: {product.id}
                            </small>
                          </td>

                          <td>
                            <Badge bg="light" text="dark">
                              {product.category}
                            </Badge>
                          </td>

                          <td className="fw-semibold">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                          </td>

                          <td>{product.stock} units</td>

                          <td>
                            <Badge
                              bg={inStock ? "success" : "danger"}
                              pill
                            >
                              {inStock ? "Available" : "Out of Stock"}
                            </Badge>
                          </td>

                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => handleEdit(product)}
                              >
                                Edit
                              </Button>

                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDeleteClick(product)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center text-secondary py-5"
                      >
                        {search
                          ? "No matching products found 🔍"
                          : "No products available. Add your first product! ✨"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <ProductForm
        show={showForm}
        onHide={() => {
          setShowForm(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />

      {/* Delete confirmation modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => {
          if (!deleting) {
            setShowDeleteModal(false);
            setProductToDelete(null);
          }
        }}
        centered
      >
        <Modal.Header closeButton={!deleting}>
          <Modal.Title>🗑️ Delete Product?</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to delete{" "}
          <strong>{productToDelete?.name}</strong>?
          This action cannot be undone.
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="light"
            disabled={deleting}
            onClick={() => {
              setShowDeleteModal(false);
              setProductToDelete(null);
            }}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            disabled={deleting}
            onClick={handleDeleteConfirm}
          >
            {deleting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              "Yes, Delete"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ProductTable;
