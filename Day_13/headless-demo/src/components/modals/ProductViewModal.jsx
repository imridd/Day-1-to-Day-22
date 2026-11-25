import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";

function ProductViewModal({
  show,
  onHide,
  product,
}) {
  if (!product) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Product Details
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Table bordered>
          <tbody>

            <tr>
              <td>
                <strong>
                  Product Name
                </strong>
              </td>
              <td>{product.name}</td>
            </tr>

            <tr>
              <td>
                <strong>
                  Category
                </strong>
              </td>
              <td>
                {product.category}
              </td>
            </tr>

            <tr>
              <td>
                <strong>
                  Price
                </strong>
              </td>
              <td>
                ₹{product.price}
              </td>
            </tr>

            <tr>
              <td>
                <strong>
                  Stock Quantity
                </strong>
              </td>
              <td>
                {product.stock}
              </td>
            </tr>

          </tbody>
        </Table>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onHide}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProductViewModal;