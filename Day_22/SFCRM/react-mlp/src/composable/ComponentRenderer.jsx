
import { componentRegistry } from "../config/componentRegistry";

export default function ComponentRenderer({
  config,
  registry = {},
  context = {}
}) {
  if (!config) return null;

  const components = {
    ...componentRegistry,
    ...registry
  };

  const Component = components[config.component];

  if (!Component) {
    console.error(
      `Component "${config.component}" is not registered.`
    );

    return (
      <div className="component-renderer-error">
        Unknown component: {config.component}
      </div>
    );
  }

  function resolveValue(value) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof value.$context === "string"
    ) {
      return context[value.$context];
    }

    if (Array.isArray(value)) {
      return value.map(resolveValue);
    }

    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [
          key,
          resolveValue(item)
        ])
      );
    }

    return value;
  }

  const props = Object.fromEntries(
    Object.entries(config.props || {}).map(([key, value]) => [
      key,
      resolveValue(value)
    ])
  );

  return <Component {...props} />;
}
