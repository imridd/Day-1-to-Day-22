
import config from "../config/config.json";
import ComponentRenderer from "./ComponentRenderer";

function PageRenderer({ pageName }) {
  const pageConfig = config.pages?.[pageName];

  if (!pageConfig) {
    return (
      <div className="alert alert-danger m-4">
        Page configuration not found: {pageName}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="fw-bold">{pageConfig.title}</h2>
        <p className="text-secondary">
          {pageConfig.description}
        </p>
      </div>

      <div className="row g-4">
        {pageConfig.components?.map((component, index) => (
          <div
            key={`${component.type}-${index}`}
            className={
              component.layout === "half"
                ? "col-12 col-md-6"
                : "col-12"
            }
          >
            <ComponentRenderer component={component} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PageRenderer;
