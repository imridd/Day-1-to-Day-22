
import { useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  X
} from "lucide-react";

import {
  navigationConfig,
  secondaryNavigation
} from "../../config/navigationConfig";

import "./Sidebar.css";

export default function Sidebar({
  activeTab = "dashboard",
  onNavigate,
  currentUser,
  onLogout,
  can,
  permissionLoading = false,
  mobileOpen = false,
  onClose
}) {
  const [collapsed, setCollapsed] = useState(false);

  const userName = currentUser?.Name || "Demo User";
  const userRole = currentUser?.Role || "CRM User";

  const getInitials = (name = "Demo User") =>
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  // Check whether the user has access to a CRM module.
  const hasModuleAccess = (moduleId) => {
    if (moduleId === "dashboard") return true;

    if (permissionLoading || typeof can !== "function") {
      return false;
    }

    return ["C", "R", "U", "D"].some((action) =>
      can(moduleId, action)
    );
  };

  const visibleNavigation = navigationConfig.filter((item) =>
    hasModuleAccess(item.id)
  );

  // Preferences are independent of CRM object permissions.
  const visibleSecondaryNavigation = secondaryNavigation;

  const handleNavigation = (itemId) => {
    onNavigate?.(itemId);
    onClose?.();
  };

  const handleLogout = () => {
    if (!onLogout) return;

    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (confirmed) {
      onLogout();
      onClose?.();
    }
  };

  const handleCollapse = () => {
    setCollapsed((previous) => !previous);
  };

  const renderNavigationItem = (item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        type="button"
        className={`sidebar-item ${isActive ? "active" : ""}`}
        onClick={() => handleNavigation(item.id)}
        title={collapsed ? item.label : undefined}
        aria-label={item.label}
        aria-current={isActive ? "page" : undefined}
      >
        <span className="sidebar-icon">
          {Icon && <Icon size={19} strokeWidth={2} />}
        </span>

        {!collapsed && (
          <span className="sidebar-item-content">
            <span className="sidebar-item-label">
              {item.label}
            </span>

            {item.description && (
              <span className="sidebar-item-description">
                {item.description}
              </span>
            )}
          </span>
        )}

        {isActive && !collapsed && (
          <span className="sidebar-active-dot" />
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={onClose}
          aria-label="Close navigation backdrop"
        />
      )}

      <aside
        className={[
          "crm-sidebar",
          collapsed ? "collapsed" : "",
          mobileOpen ? "mobile-open" : ""
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-logo">
            <Zap size={22} fill="currentColor" />
          </div>

          {!collapsed && (
            <div className="brand-info">
              <h2>NEXUS</h2>
              <span>CRM WORKSPACE</span>
            </div>
          )}

          {/* Mobile close */}
          <button
            type="button"
            className="sidebar-mobile-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        {/* Desktop collapse */}
        <button
          type="button"
          className="sidebar-collapse"
          onClick={handleCollapse}
          aria-label={
            collapsed ? "Expand sidebar" : "Collapse sidebar"
          }
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight size={17} />
          ) : (
            <ChevronLeft size={17} />
          )}
        </button>

        {/* Main navigation */}
        <div className="sidebar-section">
          {!collapsed && (
            <p className="sidebar-section-title">
              WORKSPACE
            </p>
          )}

          <nav
            className="sidebar-navigation"
            aria-label="Workspace navigation"
          >
            {visibleNavigation.map(renderNavigationItem)}
          </nav>
        </div>

        {/* Preferences */}
        {visibleSecondaryNavigation.length > 0 && (
          <div className="sidebar-secondary">
            {!collapsed && (
              <p className="sidebar-section-title">
                PREFERENCES
              </p>
            )}

            <nav
              className="sidebar-navigation"
              aria-label="Preferences navigation"
            >
              {visibleSecondaryNavigation.map(
                renderNavigationItem
              )}
            </nav>
          </div>
        )}

        {/* User profile */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {getInitials(userName)}
          </div>

          {!collapsed && (
            <div className="user-details">
              <strong title={userName}>
                {userName}
              </strong>

              <span title={userRole}>
                {userRole}
              </span>
            </div>
          )}

          {!collapsed && onLogout && (
            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={17} />
            </button>
          )}
        </div>

        {/* Collapsed logout */}
        {collapsed && onLogout && (
          <button
            type="button"
            className="collapsed-logout"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        )}
      </aside>
    </>
  );
}
