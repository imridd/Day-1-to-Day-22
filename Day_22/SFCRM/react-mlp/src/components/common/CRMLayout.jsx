
import { useCallback, useEffect, useState } from "react";

import Sidebar from "./SideBar";
import Topbar from "./Topbar";
import DashboardPage from "../dashboard/DashboardPage";
import "./CRMLayout.css";
import ModuleCRUDManager from "../../composable/ModuleCRUDManager";

import { crmModules } from "../../config/modules";
import usePermissions from "../../hooks/usePermissions";

const PAGE_NAMES = {
  dashboard: "Dashboard",
  leads: "Leads",
  contacts: "Contacts",
  accounts: "Accounts",
  opportunities: "Opportunities",
  tasks: "Tasks",
  cases: "Cases",
  settings: "Settings"
};

const DEFAULT_USER = {
  Id: "u1",
  Name: "Morgan Admin",
  Role: "Administrator",
  Initials: "MA",
  Color: "#0176d3"
};

export default function CRMLayout({
  currentUser: loggedInUser,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    user,
    loading: permissionLoading,
    can
  } = usePermissions();

  const currentUser = loggedInUser || user || DEFAULT_USER;

  const activeModule = crmModules[activeTab];

  // Check whether the user has access to a module
  const hasModuleAccess = useCallback(
    (moduleId) => {
      if (moduleId === "dashboard" || moduleId === "settings") {
        return true;
      }

      if (permissionLoading) {
        return false;
      }

      return ["C", "R", "U", "D"].some((action) =>
        can(moduleId, action)
      );
    },
    [can, permissionLoading]
  );

  // Close mobile sidebar
  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Navigate between CRM modules
  const handleNavigate = useCallback(
    (tab) => {
      if (permissionLoading || !hasModuleAccess(tab)) {
        return;
      }

      setActiveTab(tab);
      closeSidebar();
    },
    [permissionLoading, hasModuleAccess, closeSidebar]
  );

  // Toggle mobile sidebar
  const handleMenuClick = useCallback(() => {
    setSidebarOpen((previous) => !previous);
  }, []);

  // Global search placeholder
  const handleSearch = useCallback((value) => {
    console.log("Global search:", value);
  }, []);

  // Redirect to dashboard if the active module is inaccessible
  useEffect(() => {
    if (permissionLoading) {
      return;
    }

    if (!hasModuleAccess(activeTab)) {
      setActiveTab("dashboard");
    }
  }, [activeTab, permissionLoading, hasModuleAccess]);

  return (
    <div className="crm-layout">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={onLogout}
        can={can}
        permissionLoading={permissionLoading}
        mobileOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main Application Area */}
      <div className="crm-main">
        {/* Top Navigation */}
        <Topbar
          activePage={PAGE_NAMES[activeTab] || "Dashboard"}
          currentUser={currentUser}
          onMenuClick={handleMenuClick}
          onSearch={handleSearch}
        />

        {/* Page Workspace */}
        <main className="crm-workspace">
          {permissionLoading ? (
            <div
              className="crm-workspace-message"
              role="status"
            >
              Loading permissions...
            </div>
          ) : activeTab === "dashboard" ? (
            <DashboardPage />
          ) : activeTab === "settings" ? (
            <div className="crm-workspace-message">
              <h2>Settings</h2>
              <p>Settings page is coming next.</p>
            </div>
          ) : activeModule ? (
            <ModuleCRUDManager
              key={activeTab}
              moduleConfig={activeModule}
              currentUser={currentUser}
              can={can}
              permissionLoading={permissionLoading}
            />
          ) : (
            <div className="crm-workspace-message">
              <h2>Page not found</h2>
              <p>Select a valid CRM module.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
