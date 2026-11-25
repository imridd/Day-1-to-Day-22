
import DynamicForm from "../composable/DynamicForm";
import DataTable from "../composable/DataTable";
import RecordDrawer from "../composable/RecordDrawer";
import FilterBar from "../composable/FilterBar";
import StatsCards from "../composable/StatsCards";
import ConfirmDialog from "../composable/ConfirmDialog";

/**
 * Central registry for reusable CRM components.
 *
 * The configuration uses component names as keys.
 * ComponentRenderer uses these keys to render components dynamically.
 */

export const componentRegistry = {
  DynamicForm,
  DataTable,
  RecordDrawer,
  FilterBar,
  StatsCards,
  ConfirmDialog
};

/**
 * Safely retrieve a registered component.
 */
export function getRegisteredComponent(componentName) {
  return componentRegistry[componentName] || null;
}

/**
 * Check whether a component is registered.
 */
export function isComponentRegistered(componentName) {
  return Object.prototype.hasOwnProperty.call(
    componentRegistry,
    componentName
  );
}

/**
 * Get all registered component names.
 */
export function getRegisteredComponentNames() {
  return Object.keys(componentRegistry);
}
