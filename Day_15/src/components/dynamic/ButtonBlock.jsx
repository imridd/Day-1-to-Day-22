
import { Button } from "react-bootstrap";

export default function ButtonBlock({
  buttonText = "Click Here",
  buttonUrl = "#",
  buttonColor = "primary",
  alignment = "center",
  buttonSize = "lg",
  openInNewTab = false,
}) {
  return (
    <div
      className="my-4"
      style={{
        display: "flex",
        justifyContent:
          alignment === "left"
            ? "flex-start"
            : alignment === "right"
            ? "flex-end"
            : "center",
      }}
    >
      <Button
        variant={buttonColor}
        size={buttonSize}
        href={buttonUrl || "#"}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
        className="rounded-pill px-4 fw-semibold"
      >
        {buttonText || "Click Here"} ↗
      </Button>
    </div>
  );
}
