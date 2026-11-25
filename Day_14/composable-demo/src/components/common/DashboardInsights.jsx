
import { useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Badge,
  ProgressBar,
  Button,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

function DashboardInsights() {
  const employees = useSelector(
    (state) => state.employees.employees
  );

  const products = useSelector(
    (state) => state.products.products
  );

  const departmentData = useMemo(() => {
    const departments = {};

    employees.forEach((employee) => {
      const department = employee.department || "Other";
      departments[department] = (departments[department] || 0) + 1;
    });

    return Object.entries(departments).map(([name, count]) => ({
      name,
      count,
      percentage: employees.length
        ? Math.round((count / employees.length) * 100)
        : 0,
    }));
  }, [employees]);

  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active"
  ).length;

  const outOfStock = products.filter(
    (product) => Number(product.stock) === 0
  );

  // Low stock means between 1 and 5 units.
  const lowStock = products.filter(
    (product) =>
      Number(product.stock) > 0 &&
      Number(product.stock) <= 5
  );

  const totalStock = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0
  );

  return (
    <div className="mt-4">
      {/* Section heading */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">
            Your workspace, decoded ✨
          </h4>
          <p className="text-secondary mb-0">
            A little more insight into what's happening.
          </p>
        </div>

        <Badge bg="dark" pill className="px-3 py-2">
          LIVE OVERVIEW
        </Badge>
      </div>

      <Row className="g-4">
        {/* Team Pulse */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <div className="fs-3">👥</div>
                  <h5 className="fw-bold mb-1">
                    Team Pulse
                  </h5>
                  <p className="text-secondary small mb-0">
                    Your people at a glance
                  </p>
                </div>

                <Badge bg="success" pill>
                  {activeEmployees} Active
                </Badge>
              </div>

              {departmentData.length > 0 ? (
                departmentData.map((department) => (
                  <div key={department.name} className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="fw-semibold small">
                        {department.name}
                      </span>

                      <span className="text-secondary small">
                        {department.count} people · {department.percentage}%
                      </span>
                    </div>

                    <ProgressBar
                      now={department.percentage}
                      variant="info"
                      style={{ height: "9px" }}
                    />
                  </div>
                ))
              ) : (
                <p className="text-secondary">
                  No employee data available yet.
                </p>
              )}

              <div className="border-top pt-3 mt-4 d-flex justify-content-between align-items-center">
                <span className="text-secondary small">
                  {employees.length} team members total
                </span>

                <Button
                  as={Link}
                  to="/employees"
                  variant="outline-dark"
                  size="sm"
                  className="rounded-pill"
                >
                  View team →
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Inventory Radar */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <div className="fs-3">📦</div>
                  <h5 className="fw-bold mb-1">
                    Inventory Radar
                  </h5>
                  <p className="text-secondary small mb-0">
                    Keep your stock in check
                  </p>
                </div>

                <Badge bg="dark" pill>
                  {totalStock} Units
                </Badge>
              </div>

              <div className="d-flex gap-3 mb-3">
                <div className="bg-danger bg-opacity-10 rounded-4 p-3 flex-fill">
                  <div className="text-danger fw-bold fs-2">
                    {outOfStock.length}
                  </div>
                  <div className="small text-secondary">
                    Out of stock
                  </div>
                </div>

                <div className="bg-warning bg-opacity-10 rounded-4 p-3 flex-fill">
                  <div className="text-warning-emphasis fw-bold fs-2">
                    {lowStock.length}
                  </div>
                  <div className="small text-secondary">
                    Low stock
                  </div>
                </div>
              </div>

              {outOfStock.length > 0 || lowStock.length > 0 ? (
                <div className="mt-3">
                  <p className="small fw-bold mb-2">
                    Needs attention
                  </p>

                  {[...outOfStock, ...lowStock]
                    .slice(0, 4)
                    .map((product) => (
                      <div
                        key={product.id}
                        className="d-flex justify-content-between align-items-center border-bottom py-2"
                      >
                        <span className="small fw-semibold">
                          {product.name}
                        </span>

                        <Badge
                          bg={
                            Number(product.stock) === 0
                              ? "danger"
                              : "warning"
                          }
                          text={
                            Number(product.stock) === 0
                              ? "white"
                              : "dark"
                          }
                        >
                          {Number(product.stock) === 0
                            ? "Out of stock"
                            : `${product.stock} left`}
                        </Badge>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-3">
                  <div className="fs-2">🎉</div>
                  <p className="text-success fw-semibold mb-0">
                    Stock looks good!
                  </p>
                  <small className="text-secondary">
                    No low-stock products right now.
                  </small>
                </div>
              )}

              <div className="border-top pt-3 mt-3 text-end">
                <Button
                  as={Link}
                  to="/products"
                  variant="outline-dark"
                  size="sm"
                  className="rounded-pill"
                >
                  Manage products →
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col xs={12}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <Row className="align-items-center g-3">
                <Col lg={5}>
                  <h5 className="fw-bold mb-1">
                    Make your next move ⚡
                  </h5>
                  <p className="text-secondary small mb-0">
                    Jump straight into the things you do most.
                  </p>
                </Col>

                <Col lg={7}>
                  <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                    <Button
                      as={Link}
                      to="/employees"
                      variant="dark"
                      className="rounded-pill px-4"
                    >
                      👤 Manage team
                    </Button>

                    <Button
                      as={Link}
                      to="/products"
                      variant="outline-primary"
                      className="rounded-pill px-4"
                    >
                      🛍️ Manage inventory
                    </Button>

                    <Button
                      as={Link}
                      to="/dashboard"
                      variant="outline-secondary"
                      className="rounded-pill px-4"
                    >
                      🏠 Overview
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default DashboardInsights;
