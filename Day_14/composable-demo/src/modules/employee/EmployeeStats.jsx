
import { useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import StatsCard from "../../components/common/StatsCard";
import { fetchEmployees } from "./employeeSlice";

function EmployeeStats() {
  const dispatch = useDispatch();

  const { employees, loading } = useSelector(
    (state) => state.employees
  );

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active"
  ).length;

  const employeesOnLeave = employees.filter(
    (employee) => employee.status === "On Leave"
  ).length;

  const inactiveEmployees = employees.filter(
    (employee) => employee.status === "Inactive"
  ).length;

  return (
    <Row className="g-4">
      <Col md={3}>
        <StatsCard
          title="Total Employees"
          value={loading ? "..." : totalEmployees}
          icon="👥"
          trend="Team size"
        />
      </Col>

      <Col md={3}>
        <StatsCard
          title="Active Employees"
          value={loading ? "..." : activeEmployees}
          icon="✨"
          trend="Currently active"
        />
      </Col>

      <Col md={3}>
        <StatsCard
          title="On Leave"
          value={loading ? "..." : employeesOnLeave}
          icon="🌴"
          trend="On leave"
        />
      </Col>

      <Col md={3}>
        <StatsCard
          title="Inactive"
          value={loading ? "..." : inactiveEmployees}
          icon="💤"
          trend="Inactive team"
        />
      </Col>
    </Row>
  );
}

export default EmployeeStats;

