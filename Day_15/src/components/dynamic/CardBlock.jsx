
import { useState } from "react";
import { Card, Row, Col, Badge, Table } from "react-bootstrap";

export default function CardBlock({
  title = "Records",
  data = [],
  backgroundColor = "#ffffff",
  textColor = "#20243a",
}) {
  const records = Array.isArray(data) ? data : [];

  const [selectedRecord, setSelectedRecord] = useState(null);

  return (
    <section className="my-4">

      <h2 className="section-heading mb-3">
        {title}
      </h2>

      {/* Individual Cards */}
      <Row xs={1} md={2} lg={3} className="g-3">

        {records.map((item, index) => (
          <Col key={item.id || index}>

            <Card
              onClick={() => setSelectedRecord(item)}
              className="h-100 border-0 shadow-sm"
              style={{
                cursor: "pointer",
                borderRadius: "16px",
                background: selectedRecord === item
                  ? "#e9e7ff"
                  : backgroundColor,
                color: textColor,
                border:
                  selectedRecord === item
                    ? "2px solid #725cff"
                    : "2px solid transparent",
                transition: "0.2s ease",
              }}
            >

              <Card.Body className="p-3">

                <div className="d-flex justify-content-between mb-2">

                  <Badge bg="primary">
                    #{item.id || index + 1}
                  </Badge>

                  {selectedRecord === item && (
                    <Badge bg="success">
                      Selected
                    </Badge>
                  )}

                </div>

                <Card.Title className="fw-bold">
                  {item.title || item.name || `Record ${index + 1}`}
                </Card.Title>

                <Card.Text className="text-muted">
                  {String(
                    item.description || item.body || "No description"
                  ).slice(0, 100)}
                  ...
                </Card.Text>

                <small className="text-primary fw-semibold">
                  Click to preview ↗
                </small>

              </Card.Body>

            </Card>

          </Col>
        ))}

      </Row>

      {/* Selected Card Preview */}
      {selectedRecord && (

        <Card
          className="mt-4 border-0 shadow-sm"
          style={{
            borderRadius: "18px",
            background: "#ffffff",
          }}
        >

          <Card.Body className="p-4">

            <div className="d-flex justify-content-between align-items-center mb-3">

              <div>
                <Badge bg="success" className="mb-2">
                  SELECTED RECORD
                </Badge>

                <h4 className="fw-bold mb-0">
                  {selectedRecord.title ||
                    selectedRecord.name ||
                    "Record Preview"}
                </h4>
              </div>

              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setSelectedRecord(null)}
              >
                Close ✕
              </button>

            </div>

            <div className="table-responsive">

              <Table bordered hover className="align-middle mb-0">

                <thead>
                  <tr>
                    <th style={{ width: "30%" }}>
                      Field
                    </th>
                    <th>
                      Value
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {Object.entries(selectedRecord).map(
                    ([key, value]) => (

                      <tr key={key}>

                        <td className="fw-semibold">
                          {key}
                        </td>

                        <td style={{ whiteSpace: "pre-wrap" }}>
                          {value === null || value === undefined
                            ? "—"
                            : typeof value === "object"
                            ? JSON.stringify(value, null, 2)
                            : String(value)}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </Table>

            </div>

          </Card.Body>

        </Card>

      )}

      {!records.length && (
        <div className="text-muted text-center py-4">
          No records available.
        </div>
      )}

    </section>
  );
}
