import Card from "react-bootstrap/Card";

function DashboardCard({
  title,
  count,
  icon,
  bgColor,
  onClick,
}) {
  return (
    <Card
      className="
      dashboard-card
      glass-card
      border-0
      h-100
      fade-up
      "
      style={{
        background: bgColor,
        cursor: onClick
          ? "pointer"
          : "default",
      }}
      onClick={onClick}
    >
      <Card.Body>

        <div className="d-flex justify-content-between align-items-center">

          <div>

            <h6 className="text-muted mb-2">
              {title}
            </h6>

            <h2 className="fw-bold mb-0">
              {count}
            </h2>

          </div>

          <div
            className="
            d-flex
            align-items-center
            justify-content-center
            "
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              background:
                "rgba(255,255,255,0.5)",
            }}
          >
            <i
              className={`${icon} fs-2`}
            ></i>
          </div>

        </div>

      </Card.Body>
    </Card>
  );
}

export default DashboardCard;