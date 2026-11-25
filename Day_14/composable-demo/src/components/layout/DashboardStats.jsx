
import { useEffect } from "react";
import { Row, Col, Spinner, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import StatsCard from "../common/StatsCard";
import { fetchEmployees } from "../../modules/employee/employeeSlice";
import { fetchProducts } from "../../modules/product/productSlice";

function DashboardStats() {
  const dispatch = useDispatch();

  const {
    employees,
    loading: employeeLoading,
    error: employeeError,
  } = useSelector((state) => state.employees);

  const {
    products,
    loading: productLoading,
    error: productError,
  } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchProducts());
  }, [dispatch]);

  if (employeeLoading || productLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="text-secondary mt-2">Loading dashboard data...</p>
      </div>
    );
  }

  if (employeeError || productError) {
    return (
      <Alert variant="danger">
        {employeeError && <p>Employee API: {employeeError}</p>}
        {productError && <p>Product API: {productError}</p>}
        Check whether JSON Server is running on port 5000.
      </Alert>
    );
  }

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active"
  ).length;

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0
  );

  return (
    <Row className="g-4">
      <Col md={6} xl={3}>
        <StatsCard
          title="Total Employees"
          value={totalEmployees}
          icon="👥"
          trend="Live team data"
        />
      </Col>

      <Col md={6} xl={3}>
        <StatsCard
          title="Active Employees"
          value={activeEmployees}
          icon="✨"
          trend="Live team data"
        />
      </Col>

      <Col md={6} xl={3}>
        <StatsCard
          title="Total Products"
          value={totalProducts}
          icon="🛍️"
          trend="Live catalogue"
        />
      </Col>

      <Col md={6} xl={3}>
        <StatsCard
          title="Total Inventory"
          value={totalStock}
          icon="📦"
          trend="Live stock data"
        />
      </Col>
    </Row>
  );
}

export default DashboardStats;
