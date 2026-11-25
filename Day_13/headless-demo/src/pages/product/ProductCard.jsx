
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

function ProductCard({
  product,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <Card className="employee-card p-3">
      <Card.Body>
        <h5>{product.name}</h5>

        <p>
          Category: {product.category}
        </p>

        <p>
          Price: ₹{product.price}
        </p>

        <p>
          Stock: {product.stock}
        </p>

        <div className="d-flex gap-2">
          <Button
            size="sm"
            onClick={() =>
              onView(product)
            }
          >
            View
          </Button>

          <Button
            size="sm"
            variant="warning"
            onClick={() =>
              onEdit(product)
            }
          >
            Edit
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() =>
              onDelete(product.id)
            }
          >
            Delete
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;