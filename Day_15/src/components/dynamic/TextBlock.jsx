import { Container } from "react-bootstrap";
export default function TextBlock({
  heading = "A little more context",
  content = "Add your content here.",
  alignment = "left",
  fontSize = "1.1",
  textColor = "#272b3d",
  backgroundColor = "transparent",
  padding = "2",
}) {
  return (
    <section
      className="my-4 rounded-4"
      style={{
        background: backgroundColor,
        color: textColor,
        padding: `${padding}rem`,
        textAlign: alignment,
      }}
    >
      <Container>
        <h2 className="section-heading">{heading}</h2>
        <p style={{ fontSize: `${fontSize}rem`, whiteSpace: "pre-wrap" }}>
          {content}
        </p>
      </Container>
    </section>
  );
}
