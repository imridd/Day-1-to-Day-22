
import {
  LayoutDashboard,
  Users,
  Contact,
  Building2,
  TrendingUp,
  CheckSquare,
  Headset,
  Settings
} from "lucide-react";

/**
 * Central navigation configuration for the CRM.
 *
 * Each item contains:
 * - id: unique module identifier
 * - label: sidebar display name
 * - path: logical navigation path
 * - icon: Lucide icon component
 * - description: short module description
 */

export const navigationConfig = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    description: "Your CRM overview"
  },
  {
    id: "leads",
    label: "Leads",
    path: "/leads",
    icon: Users,
    description: "Manage potential customers"
  },
  {
    id: "contacts",
    label: "Contacts",
    path: "/contacts",
    icon: Contact,
    description: "Manage customer contacts"
  },
  {
    id: "accounts",
    label: "Accounts",
    path: "/accounts",
    icon: Building2,
    description: "Manage business accounts"
  },
  {
    id: "opportunities",
    label: "Opportunities",
    path: "/opportunities",
    icon: TrendingUp,
    description: "Track sales opportunities"
  },
  {
    id: "tasks",
    label: "Tasks",
    path: "/tasks",
    icon: CheckSquare,
    description: "Track activities and follow-ups"
  },
  {
    id: "cases",
    label: "Cases",
    path: "/cases",
    icon: Headset,
    description: "Manage customer support cases"
  }
];

export const secondaryNavigation = [
  {
    id: "settings",
    label: "Settings",
    path: "/settings",
    icon: Settings,
    description: "CRM preferences"
  }
];

/**
 * Find a navigation item by its ID.
 */
export function getNavigationItem(id) {
  return [
    ...navigationConfig,
    ...secondaryNavigation
  ].find((item) => item.id === id) || null;
}

/**
 * Find a navigation item by its path.
 */
export function getNavigationByPath(path) {
  return [
    ...navigationConfig,
    ...secondaryNavigation
  ].find((item) => item.path === path) || null;
}
