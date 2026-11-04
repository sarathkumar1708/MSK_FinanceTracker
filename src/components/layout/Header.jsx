
import { useState } from "react";
import {
  Menu,
  Bell,
  ChevronRight,
  Home,
  LogOut,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { navigationItems } from "../../config/navigation";
import "./Header.css"

function Header({ onMenuClick, onLogout, user }) {
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  let breadcrumbs = [];

  for (const item of navigationItems) {
    if (item.children) {
      const child = item.children.find(
        (subItem) => subItem.path === location.pathname
      );

      if (child) {
        breadcrumbs = [item.title, child.title];
        break;
      }
    } else if (item.path === location.pathname) {
      breadcrumbs = [item.title];
      break;
    }
  }

  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const userName = user?.user_metadata?.name || user?.email || user?.full_name || "User";
  const avatarLetter = userName.charAt(0).toUpperCase();

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={23} />
        </button>

        <div className="breadcrumbs">
          <Home size={15} />

          {breadcrumbs.map((crumb, index) => (
            <div className="breadcrumb-item" key={crumb}>
              <ChevronRight size={14} />
              <span
                className={
                  index === breadcrumbs.length - 1
                    ? "breadcrumb-current"
                    : ""
                }
              >
                {crumb}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="header-right">
        <span className="header-date">{currentDate}</span>

        <button
          className="header-icon-button"
          aria-label="Notifications"
        >
          <Bell size={19} />
        </button>

        <div className="profile-menu-container">
          <button
            className="header-avatar"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            aria-label="Open profile menu"
            aria-expanded={showProfileMenu}
          >
            {avatarLetter}
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-info">
                <strong>{userName}</strong>
                <small>{user?.email}</small>
              </div>

              <div className="profile-dropdown-divider" />

              <button
                className="profile-logout-button"
                onClick={async () => {
                  setShowProfileMenu(false);
                  await onLogout();
                }}
              >
                <LogOut size={17} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
