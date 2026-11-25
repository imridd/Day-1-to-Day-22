
import { useState } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";

const defaults = {
  hero: {
    heading: "Your headline",
    subheading: "A short supporting line",
    description: "Tell visitors what this page is about.",
    backgroundColor: "#6d5dfc",
    textColor: "#ffffff",
    alignment: "center",
    buttonText: "Explore",
    buttonUrl: "#",
    buttonColor: "dark",
    padding: "5",
  },
  button: {
    buttonText: "Click Here",
    buttonUrl: "#",
    buttonColor: "primary",
    alignment: "center",
    buttonSize: "lg",
    openInNewTab: false,
  },

  card: {
    title: "Featured collection",
    data: [
      {
        title: "First card",
        description: "A quick description",
        buttonText: "Learn more",
        buttonLink: "#",
      },
    ],
    backgroundColor: "#ffffff",
    textColor: "#20243a",
    layout: "grid",
  },

  table: {
    title: "Quick overview",
    data: [{ id: 1, name: "Example", status: "Active" }],
    headerColor: "#171a2b",
    headerTextColor: "#ffffff",
    rowColor: "#ffffff",
    striped: true,
    hover: true,
    bordered: true,
  },

  text: {
    heading: "About this section",
    content: "Write something useful here.",
    alignment: "left",
    fontSize: "1.1",
    textColor: "#272b3d",
    backgroundColor: "#f4f3ff",
    padding: "2",
  },

  image: {
    url: "",
    alt: "Describe the image",
    caption: "",
    width: "100%",
    height: "auto",
    alignment: "center",
    radius: "18",
  },

  footer: {
    heading: "Stay connected",
    companyName: "Orbit Studio",
    description: "Made for what's next.",
    copyright: "© 2026 Orbit Studio",
    backgroundColor: "#171a2b",
    textColor: "#ffffff",
    alignment: "left",
    columns: 3,
    links: [{ label: "Home", url: "/" }],
    socialLinks: [],
    contact: "",
  },
};

const labels = {
  heading: "Heading",
  subheading: "Subheading",
  description: "Description",
  backgroundColor: "Background color",
  textColor: "Text color",
  alignment: "Alignment",
  buttonText: "Button text",
  buttonUrl: "Button URL",
  buttonColor: "Button style",
  buttonSize: "Button size",
  openInNewTab: "Open in new tab",
  padding: "Padding (rem)",
  title: "Title",
  data: "JSON data",
  layout: "Layout",
  headerColor: "Header color",
  headerTextColor: "Header text color",
  rowColor: "Row color",
  striped: "Striped rows",
  hover: "Hover rows",
  bordered: "Borders",
  content: "Content",
  fontSize: "Font size (rem)",
  url: "Image URL",
  alt: "Alternative text",
  caption: "Caption",
  width: "Width",
  height: "Height",
  radius: "Border radius (px)",
  companyName: "Company name",
  copyright: "Copyright",
  columns: "Footer columns",
  contact: "Contact information",
  links: "Footer links (JSON)",
  socialLinks: "Social links (JSON)",
};

export { defaults };

export default function ComponentEditor({ type, value, onChange }) {
  const [jsonErrors, setJsonErrors] = useState({});

  const current = { ...defaults[type], ...(value || {}) };

  const jsonFields = ["data", "links", "socialLinks"];

  function update(key, value) {
    onChange({ ...current, [key]: value });
  }

  return (
    <div className="editor-fields">
      <Row className="g-3">
        {Object.entries(current).map(([key, val]) => (
          <Col md={jsonFields.includes(key) ? 12 : 6} key={key}>
            <Form.Group>
              <Form.Label>{labels[key] || key}</Form.Label>

              {jsonFields.includes(key) ? (
                <>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={JSON.stringify(val, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setJsonErrors((p) => ({
                          ...p,
                          [key]: "",
                        }));
                        update(key, parsed);
                      } catch {
                        setJsonErrors((p) => ({
                          ...p,
                          [key]: "Enter valid JSON.",
                        }));
                      }
                    }}
                  />

                  {jsonErrors[key] && (
                    <Form.Text className="text-danger">
                      {jsonErrors[key]}
                    </Form.Text>
                  )}
                </>
              ) : typeof val === "boolean" ? (
                <Form.Check
                  type="switch"
                  label={labels[key] || key}
                  checked={val}
                  onChange={(e) => update(key, e.target.checked)}
                />
              ) : key.toLowerCase().includes("color") ? (
                <Form.Control
                  type="color"
                  value={val || "#ffffff"}
                  onChange={(e) =>
                    update(key, e.target.value)
                  }
                />
              ) : key === "alignment" ? (
                <Form.Select
                  value={val}
                  onChange={(e) =>
                    update(key, e.target.value)
                  }
                >
                  {["left", "center", "right"].map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </Form.Select>
              ) : key === "buttonColor" ? (
                <Form.Select
                  value={val}
                  onChange={(e) =>
                    update(key, e.target.value)
                  }
                >
                  {[
                    "primary",
                    "dark",
                    "success",
                    "warning",
                    "light",
                    "outline-primary",
                    "outline-dark",
                    "outline-success",
                  ].map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </Form.Select>
              ) : key === "buttonSize" ? (
                <Form.Select
                  value={val}
                  onChange={(e) =>
                    update(key, e.target.value)
                  }
                >
                  <option value="sm">Small</option>
                  <option value="lg">Large</option>
                </Form.Select>
              ) : (
                <Form.Control
                  as={
                    ["description", "content"].includes(key)
                      ? "textarea"
                      : "input"
                  }
                  rows={
                    ["content", "description"].includes(key)
                      ? 3
                      : undefined
                  }
                  type={
                    ["padding", "fontSize", "radius", "columns"].includes(key)
                      ? "number"
                      : "text"
                  }
                  value={val ?? ""}
                  onChange={(e) =>
                    update(key, e.target.value)
                  }
                />
              )}
            </Form.Group>
          </Col>
        ))}
      </Row>

      <div className="mt-3 d-flex gap-2">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => onChange({ ...defaults[type] })}
        >
          Reset defaults
        </Button>
      </div>
    </div>
  );
}
