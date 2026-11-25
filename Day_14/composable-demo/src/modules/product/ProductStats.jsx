
import { useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import StatsCard from "../../components/common/StatsCard";
import { fetchProducts } from "./productSlice";

function ProductStats() {
  const dispatch = useDispatch();

  const { products, loading } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const totalProducts = products.length;

  const availableProducts = products.filter(
    (product) => Number(product.stock) > 0
  ).length;

  const outOfStockProducts = products.filter(
    (product) => Number(product.stock) === 0
  ).length;

  const totalStock = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0
  );

  return (
    <Row className="g-4">
      <Col md={3}>
        <StatsCard
          title="Total Products"
          value={loading ? "..." : totalProducts}
          icon="🛍️"
          trend="Catalogue"
        />
      </Col>

      <Col md={3}>
        <StatsCard
          title="Available"
          value={loading ? "..." : availableProducts}
          icon="✨"
          trend="In Stock"
        />
      </Col>

      <Col md={3}>
        <StatsCard
          title="Out of Stock"
          value={loading ? "..." : outOfStockProducts}
          icon="⚠️"
          trend="Attention"
        />
      </Col>

      <Col md={3}>
        <StatsCard
          title="Total Inventory"
          value={loading ? "..." : totalStock}
          icon="📦"
          trend="Units"
        />
      </Col>
    </Row>
  );
}

export default ProductStats;

