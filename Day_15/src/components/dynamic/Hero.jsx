import { Button, Container } from "react-bootstrap";
export default function Hero({
  heading = "Make your next move.",
  subheading = "",
  description = "",
  backgroundColor = "#6d5dfc",
  textColor = "#fff",
  alignment = "center",
  buttonText = "",
  buttonUrl = "#",
  buttonColor = "dark",
  padding = "5",
}) {
  return (
    <section
      className="hero-block rounded-4 my-3"
      style={{
        background: backgroundColor,
        color: textColor,
        textAlign: alignment,
        padding: `${padding}rem 2rem`,
      }}
    >
      <Container>
        <h1 className="display-4 fw-bold mt-2">{heading}</h1>
        {subheading && <h4>{subheading}</h4>}
        <p className="lead mx-auto" style={{ maxWidth: 720 }}>
          {description}
        </p>
        {buttonText && (
          <Button
            variant={buttonColor}
            href={buttonUrl}
            className="rounded-pill px-4"
          >
            {buttonText} ↗
          </Button>
        )}
      </Container>
    </section>
  );
}
