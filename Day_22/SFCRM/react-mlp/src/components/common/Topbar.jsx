
import {
  Search,
  Bell,
  Menu,
  ChevronRight,
  Command
} from "lucide-react";

import "./Topbar.css";

export default function Topbar({
  activePage = "Dashboard",
  currentUser,
  onMenuClick,
  onSearch,
  onNotifications
}) {
  const userName = currentUser?.Name || "Demo User";

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header className="crm-topbar">

      {/* LEFT SECTION */}
      <div className="topbar-left">

        <button
          type="button"
          className="mobile-menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu size={21} />
        </button>

        <div className="topbar-breadcrumb">
          <span>Workspace</span>
          <ChevronRight size={14} />
          <strong>{activePage}</strong>
        </div>

      </div>

      {/* CENTER SECTION */}
      <div className="topbar-search">

        <Search size={18} />

        <input
          type="search"
          placeholder="Search anything..."
          aria-label="Search CRM"
          onChange={(event) => onSearch?.(event.target.value)}
        />

        <span className="search-shortcut">
          <Command size={12} />
          K
        </span>

      </div>

      {/* RIGHT SECTION */}
      <div className="topbar-right">

        <button
          type="button"
          className="notification-button"
          onClick={onNotifications}
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="notification-indicator" />
        </button>

        <div className="topbar-divider" />

        <div className="topbar-user">
          <div className="topbar-user-info">
            <strong>{userName}</strong>
            <span>{currentUser?.Role || "CRM User"}</span>
          </div>

          <div className="topbar-avatar">
            {initials}
          </div>
        </div>

      </div>

    </header>
  );
}
