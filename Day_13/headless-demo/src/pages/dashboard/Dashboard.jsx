
import { useMemo, useEffect } from "react";
import { useSelector } from "react-redux";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import { useEmployees } from "../../hooks/useEmployees";
import { useProducts } from "../../hooks/useProducts";
import { useCourses } from "../../hooks/useCourses";

import {
  FaUsers,
  FaBoxOpen,
  FaBookOpen,
  FaRupeeSign,
  FaBuilding,
  FaUserGraduate,
} from "react-icons/fa";

import StatsCard from "./StatsCard";
import DepartmentChart from "./DepartmentChart";
import ProductChart from "./ProductChart";
import CourseChart from "./CourseChart";
import RecentActivity from "./RecentActivity";
import QuickActions from "./QuickActions";

function Dashboard() {
  const { employees } = useSelector(
    (state) => state.employees
  );

  const { products } = useSelector(
    (state) => state.products
  );

  const { courses } = useSelector(
    (state) => state.courses
  );
  const { fetchEmployees } =
    useEmployees();

  const { fetchProducts } =
    useProducts();

  const { fetchCourses } =
    useCourses();
  useEffect(() => {
    Promise.all([
      fetchEmployees(),
      fetchProducts(),
      fetchCourses(),
    ]);
  }, []);

  const inventoryValue = useMemo(() => {
    return products.reduce(
      (total, product) =>
        total +
        Number(product.price || 0) *
        Number(product.stock || 0),
      0
    );
  }, [products]);

  const totalStudents = useMemo(() => {
    return courses.reduce(
      (total, course) =>
        total +
        Number(
          course.enrolledStudents || 0
        ),
      0
    );
  }, [courses]);

  const departmentData = useMemo(() => {
    const grouped = {};

    employees.forEach((employee) => {
      const dept =
        employee.department || "Others";

      grouped[dept] =
        (grouped[dept] || 0) + 1;
    });

    return Object.keys(grouped).map(
      (key) => ({
        name: key,
        count: grouped[key],
      })
    );
  }, [employees]);

  const productChartData = useMemo(() => {
    return products.slice(0, 10).map(
      (product) => ({
        name: product.name,
        stock: Number(
          product.stock || 0
        ),
      })
    );
  }, [products]);

  const courseChartData = useMemo(() => {
    return courses.map((course) => ({
      name: course.name,
      students: Number(
        course.enrolledStudents || 0
      ),
    }));
  }, [courses]);

  const departmentCount =
    new Set(
      employees.map(
        (employee) =>
          employee.department
      )
    ).size;

  return (
    <div className="dashboard-page">
      {/* Header */}

      <div className="dashboard-header">
        <div>
          <h2 className="fw-bold">
            Dashboard
          </h2>

          <p className="text mb-2">
            Employee, Product &
            Course Analytics
          </p>
        </div>

        <QuickActions />
      </div>

      {/* Stats Section */}

      <Row className="g-4 mb-4">
        <Col lg={4} md={6}>
          <StatsCard
            title="Employees"
            count={employees.length}
            icon={
              <FaUsers size={30} />
            }
            color="#6366f1"
          />
        </Col>

        <Col lg={4} md={6}>
          <StatsCard
            title="Products"
            count={products.length}
            icon={
              <FaBoxOpen size={30} />
            }
            color="#8b5cf6"
          />
        </Col>

        <Col lg={4} md={6}>
          <StatsCard
            title="Courses"
            count={courses.length}
            icon={
              <FaBookOpen size={30} />
            }
            color="#06b6d4"
          />
        </Col>

        <Col lg={4} md={6}>
          <StatsCard
            title="Inventory Value"
            count={`₹${inventoryValue.toLocaleString()}`}
            icon={
              <FaRupeeSign size={30} />
            }
            color="#10b981"
          />
        </Col>

        <Col lg={4} md={6}>
          <StatsCard
            title="Students"
            count={totalStudents}
            icon={
              <FaUserGraduate size={30} />
            }
            color="#f59e0b"
          />
        </Col>

        <Col lg={4} md={6}>
          <StatsCard
            title="Departments"
            count={departmentCount}
            icon={
              <FaBuilding size={30} />
            }
            color="#ef4444"
          />
        </Col>
      </Row>

      {/* Charts */}

      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Card className="glass-card h-100">
            <Card.Body>
              <h5 className="mb-3">
                Employees By Department
              </h5>

              <DepartmentChart
                data={departmentData}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="glass-card h-100">
            <Card.Body>
              <h5 className="mb-3">
                Product Stocks
              </h5>

              <ProductChart
                data={productChartData}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={12}>
          <Card className="glass-card">
            <Card.Body>
              <h5 className="mb-3">
                Course Enrollments
              </h5>

              <CourseChart
                data={courseChartData}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}

      <Row>
        <Col lg={12}>
          <RecentActivity
            employees={employees}
            products={products}
            courses={courses}
          />
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
