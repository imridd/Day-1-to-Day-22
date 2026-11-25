
import { componentRegistry } from "./componentRegistry";

function ComponentRenderer({ component }) {

  if (!component || !component.type) {
    return (
      <div className="alert alert-warning">
        Invalid component configuration!
      </div>
    );
  }
  const Component = componentRegistry[component.type];
  if (!Component) {
    return (
      <div className="alert alert-warning">
        Component "{component.type}" is not registered yet!
      </div>
    );
  }
  return <Component {...(component.props || {})} />;
}

export default ComponentRenderer;
