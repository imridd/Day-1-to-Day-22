import { componentRegistry } from "../config/componentRegistry";
export default function ComponentRenderer({ component }) {
  const Component = componentRegistry[component?.type];
  if (!Component)
    return (
      <div className="alert alert-warning">
        Unsupported component: {component?.type}
      </div>
    );
  return <Component {...(component.props || {})} />;
}
