import {
  Container,
  Row,
  Col,
  Button,
  Badge,
} from "react-bootstrap";

import AppCard from "../../components/common/AppCard";

function Reports() {
  const reportCards = [
    {
      icon: "👥",
      title: "User Report",
      description:
        "Generate registration, approval and user activity reports.",
      color: "primary",
    },

    {
      icon: "👨‍💼",
      title: "Employee Report",
      description:
        "Department, employee and workforce related reports.",
      color: "success",
    },

    {
      icon: "📦",
      title: "Product Report",
      description:
        "Inventory, categories and product analytics report.",
      color: "warning",
    },

    {
      icon: "📊",
      title: "Analytics Report",
      description:
        "Generate complete business analytics summary.",
      color: "info",
    },
  ];

  return (
    <Container
      fluid
      className="
      py-4
      fade-up
      "
    >
      {/* Header */}

      <div className="mb-5">
        <h2 className="fw-bold">
          Report Center 📑
        </h2>

        <p className="text mb-2">
          Generate and export business reports
          from one central location.
        </p>
      </div>

      {/* Report Cards */}

      <Row className="g-4">
        {reportCards.map(
          (report, index) => (
            <Col
              lg={6}
              key={index}
            >
              <AppCard>
                <div className="d-flex justify-content-between align-items-center mb-3">

                  <div>
                    <h1>
                      {report.icon}
                    </h1>

                    <h4 className="fw-bold">
                      {report.title}
                    </h4>

                    <p className="text-muted">
                      {
                        report.description
                      }
                    </p>
                  </div>

                  <Badge
                    bg={report.color}
                  >
                    Available
                  </Badge>
                </div>

                <div className="d-flex gap-2">
                  <Button
                    variant={report.color}
                    className="app-btn"
                  >
                    View Report
                  </Button>

                  <Button
                    variant="outline-secondary"
                    className="app-btn"
                  >
                    Export PDF
                  </Button>
                </div>
              </AppCard>
            </Col>
          )
        )}
      </Row>

      {/* Export Center */}

      <Row className="mt-5">
        <Col>
          <AppCard>
            <h4 className="fw-bold mb-3">
              Export Center 📥
            </h4>

            <p className="text-muted">
              Download consolidated reports
              for presentations and business reviews.
            </p>

            <div className="d-flex flex-wrap gap-3">
              <Button
                variant="primary"
                className="app-btn"
              >
                📄 Export Full PDF Report
              </Button>

              <Button
                variant="success"
                className="app-btn"
              >
                📊 Export Excel Report
              </Button>

              <Button
                variant="info"
                className="app-btn"
              >
                📈 Export Analytics Summary
              </Button>
            </div>
          </AppCard>
        </Col>
      </Row>

      {/* Insights */}

      <Row className="mt-5">
        <Col>
          <AppCard>
            <h4 className="fw-bold mb-4">
              Business Insights 💡
            </h4>

            <ul className="mb-0">
              <li>
                Monitor user approval trends.
              </li>

              <li>
                Track employee department growth.
              </li>

              <li>
                Review product inventory summaries.
              </li>

              <li>
                Export management-ready reports.
              </li>

              <li>
                Analyze business statistics.
              </li>
            </ul>
          </AppCard>
        </Col>
      </Row>

    </Container>
  );
}

export default Reports;
