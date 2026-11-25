
import { useMemo } from "react";
import PageRenderer from "../common/PageRenderer";

export default function ModulePage({
  moduleConfig,
  records = [],
  loading = false,
  context = {},
  registry = {}
}) {
  const pageContext = useMemo(() => {
    const moduleName = moduleConfig?.id;

    return {
      ...context,
      records,
      [`${moduleName}`]: records,
      [`${moduleName?.slice(0, -1)}Columns`]:
        moduleConfig?.columns || []
    };
  }, [moduleConfig, records, context]);

  if (!moduleConfig) {
    return (
      <div className="module-page-error">
        Module configuration not found.
      </div>
    );
  }

  return (
    <PageRenderer
      pageConfig={moduleConfig.page}
      context={pageContext}
      registry={registry}
      loading={loading}
    />
  );
}
