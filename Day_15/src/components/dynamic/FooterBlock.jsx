import { Col, Container, Row } from "react-bootstrap";
export default function FooterBlock({
  heading = "",
  companyName = "Your brand",
  description = "",
  copyright = "",
  backgroundColor = "#171a2b",
  textColor = "#fff",
  alignment = "left",
  columns = 3,
  links = [],
  socialLinks = [],
  contact = "",
}) {
  const groups = Array.from(
    { length: Math.max(1, Number(columns) || 1) },
    (_, i) =>
      links.filter((_, j) => j % Math.max(1, Number(columns) || 1) === i),
  );
  return (
    <footer
      className="mt-5 rounded-4 p-4"
      style={{
        background: backgroundColor,
        color: textColor,
        textAlign: alignment,
      }}
    >
      <Container>
        <Row className="g-4">
          <Col md={12}>
            <h3>{heading || companyName}</h3>
            <p>{description}</p>
          </Col>
          {groups.map((g, i) => (
            <Col key={i} xs={6} md={12 / Math.min(4, groups.length)}>
              {g.map((l, j) => (
                <div key={j}>
                  <a className="footer-link" href={l.url || "#"}>
                    {l.label}
                  </a>
                </div>
              ))}
            </Col>
          ))}
          {contact && (
            <Col md={12}>
              <small>{contact}</small>
            </Col>
          )}
          {socialLinks.map((l, i) => (
            <Col xs="auto" key={i}>
              <a className="footer-link" href={l.url || "#"}>
                {l.label}
              </a>
            </Col>
          ))}
        </Row>
        <hr />
        <small>{copyright}</small>
      </Container>
    </footer>
  );
}
