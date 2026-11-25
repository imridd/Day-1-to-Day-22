import { Container } from "react-bootstrap";
import ComponentRenderer from "../renderer/ComponentRenderer";
export default function PageRenderer({ page }) {
  return (
    <Container fluid="lg" className="public-content">
      {page.components?.map((c) => (
        <ComponentRenderer key={c.id} component={c} />
      ))}
    </Container>
  );
}
