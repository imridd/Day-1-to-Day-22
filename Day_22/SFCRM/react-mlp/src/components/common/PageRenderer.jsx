
import ComponentRenderer from "../../composable/ComponentRenderer";

/**
 * Renders a complete page using its configuration.
 *
 * Page configuration:
 * - title
 * - description
 * - breadcrumbs
 * - components
 */

export default function PageRenderer({
  pageConfig,
  context = {},
  registry = {},
  loading = false
}) {
  // PAGE CONFIGURATION FALLBACK
  if (!pageConfig) {
    return (
      <main className="page-renderer">
        <section className="page-renderer-empty">
          <h2>Page configuration not found</h2>
          <p>Please provide a valid page configuration.</p>
        </section>
      </main>
    );
  }

  const {
    title,
    description,
    breadcrumbs = [],
    components = []
  } = pageConfig;

  return (
    <main className="page-renderer">

      {/* PAGE HEADER */}
      <header className="page-header">

        <nav className="page-breadcrumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((item, index) => (
            <span key={`${item}-${index}`}>
              {item}

              {index < breadcrumbs.length - 1 && (
                <span className="breadcrumb-separator">
                  /
                </span>
              )}
            </span>
          ))}
        </nav>

        <div className="page-heading">
          <div>
            <h1>{title || "Untitled Page"}</h1>

            {description && (
              <p>{description}</p>
            )}
          </div>
        </div>

      </header>

      {/* PAGE CONTENT */}
      <section className="page-content">

        {loading ? (
          <div className="page-loading">
            Loading page...
          </div>
        ) : components.length === 0 ? (
          <div className="page-empty">
            No components configured for this page.
          </div>
        ) : (
          components.map((componentConfig, index) => (
            <div
              className="page-component"
              key={
                componentConfig.id ||
                `${componentConfig.component}-${index}`
              }
            >
              <ComponentRenderer
                config={componentConfig}
                context={context}
                registry={registry}
              />
            </div>
          ))
        )}

      </section>

    </main>
  );
}
