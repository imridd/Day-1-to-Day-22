
import { useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import StatsCard from "../../components/common/StatsCard";
import { fetchCourses } from "./courseSlice";

function CourseStats() {
  const dispatch = useDispatch();

  const { courses, loading } = useSelector(
    (state) => state.courses
  );

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  // Calculate course statistics
  const totalCourses = courses.length;

  const activeCourses = courses.filter(
    (course) => course.status === "Active"
  ).length;

  const inactiveCourses = courses.filter(
    (course) => course.status === "Inactive"
  ).length;

  const totalCategories = new Set(
    courses.map((course) => course.category)
  ).size;

  return (
    <Row className="g-4">
      <Col md={3}>
        <StatsCard
          title="Total Courses"
          value={loading ? "..." : totalCourses}
          icon="📚"
          trend="All courses"
        />
      </Col>

      <Col md={3}>
        <StatsCard
          title="Active Courses"
          value={loading ? "..." : activeCourses}
          icon="✨"
          trend="Currently available"
        />
      </Col>

      <Col md={3}>
        <StatsCard
          title="Inactive Courses"
          value={loading ? "..." : inactiveCourses}
          icon="💤"
          trend="Not available"
        />
      </Col>

      <Col md={3}>
        <StatsCard
          title="Categories"
          value={loading ? "..." : totalCategories}
          icon="🏷️"
          trend="Course categories"
        />
      </Col>
    </Row>
  );
}

export default CourseStats;
