import {Badge,Button,Card,Table}from "react-bootstrap";
import { toast } from "react-toastify";
const ProductTable = ({products,onEdit,onDelete}) => {
  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;
    try {
      await onDelete(id);
      toast.success("Product Deleted Successfully");
    } catch (error) {
      toast.error("Failed To Delete Product");
    }
  };
  const getStockVariant = (stock) => {
    if (stock <= 5) return "danger";
    if (stock <= 20)
      return "warning";
    return "success";
  };
  return (
    <Card className="shadow border-0">
      <Card.Header className="bg-dark text-white">
        <h4 className="mb-0">Product List</h4>
      </Card.Header>
      <Card.Body>
        <Table striped bordered hover responsive>
          <thead className="table-primary">
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Supplier Email</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>
                    <strong>{product.name}</strong>
                  </td>
                  <td>
                    <Badge bg="info">
                      {product.category}
                    </Badge>
                  </td>
                  <td>
                    ₹{product.price}
                  </td>
                  <td>
                    <Badge bg={getStockVariant(product.stock)}>
                      {product.stock}
                    </Badge>
                  </td>
                  <td>{product.supplierEmail}</td>
                  <td>

                    {
                      product.description
                    }

                  </td>

                  <td>

                    <div className="d-flex gap-2">

                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() =>
                          onEdit(product)
                        }
                      >
                        Edit
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          handleDelete(
                            product.id
                          )
                        }
                      >
                        Delete
                      </Button>

                    </div>

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan="8"
                  className="text-center text-muted"
                >

                  No Products Found

                </td>

              </tr>

            )}

          </tbody>

        </Table>

      </Card.Body>

    </Card>

  );
};

export default ProductTable;