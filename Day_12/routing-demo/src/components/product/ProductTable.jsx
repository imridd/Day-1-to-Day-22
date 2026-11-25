
import {
  Table,
  Button,
  Badge,
} from "react-bootstrap";

import { useNavigate } from "react-router";

function ProductTable({
  products,
  onDelete,
}) {
  const navigate = useNavigate();

  return (
    <div className="table-responsive">

      <Table
        hover
        bordered
        className="
        align-middle
        app-table
        "
      >
        <thead>
          <tr>
            <th>S.No</th>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Status</th>
            <th width="180">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>

          {products.length > 0 ? (
            products.map(
              (
                product,
                index
              ) => (
                <tr
                  key={product.id}
                >

                  {/* S.No */}

                  <td>
                    <strong>
                      {index + 1}
                    </strong>
                  </td>

                  {/* Product */}

                  <td>

                    <div>

                      <h6 className="fw-bold mb-0">
                        {product.productName}
                      </h6>

                      <small className="text-muted">
                        Product
                      </small>

                    </div>

                  </td>

                  {/* Category */}

                  <td>

                    <Badge bg="info">
                      {product.category}
                    </Badge>

                  </td>

                  {/* Price */}

                  <td className="fw-bold text-success">

                    ₹
                    {Number(
                      product.price
                    ).toLocaleString()}

                  </td>

                  {/* Quantity */}

                  <td>
                    {product.quantity}
                  </td>

                  {/* Stock Status */}

                  <td>

                    {product.quantity > 10 ? (

                      <Badge bg="success">
                        In Stock
                      </Badge>

                    ) : product.quantity > 0 ? (

                      <Badge bg="warning">
                        Low Stock
                      </Badge>

                    ) : (

                      <Badge bg="danger">
                        Out Of Stock
                      </Badge>

                    )}

                  </td>

                  {/* Actions */}

                  <td>

                    <div className="d-flex gap-2">

                      <Button
                        size="sm"
                        variant="primary"
                        className="app-btn"
                        onClick={() =>
                          navigate(
                            `/products/view/${product.id}`
                          )
                        }
                      >
                        <i className="bi bi-eye"></i>
                      </Button>

                      <Button
                        size="sm"
                        variant="danger"
                        className="app-btn"
                        onClick={() =>
                          onDelete(
                            product.id
                          )
                        }
                      >
                        <i className="bi bi-trash"></i>
                      </Button>

                    </div>

                  </td>

                </tr>
              )
            )
          ) : (

            <tr>

              <td
                colSpan="7"
                className="
                text-center
                py-4
                "
              >

                <div>

                  <h5 className="text-muted">
                    No Products Found
                  </h5>

                  <p className="text-muted mb-0">
                    Add a new product
                    to get started.
                  </p>

                </div>

              </td>

            </tr>

          )}

        </tbody>

      </Table>

    </div>
  );
}

export default ProductTable;