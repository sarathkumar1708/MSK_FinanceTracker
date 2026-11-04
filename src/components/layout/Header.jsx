
import { Menu, Bell, ChevronRight, Home } from "lucide-react";
import { useLocation } from "react-router-dom";
import { navigationItems } from "../../config/navigation";

function Header({ onMenuClick }) {
  const location = useLocation();

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
    year: "numeric"
  });

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

        <div className="header-avatar">S</div>
      </div>
    </header>
  );
}

export default Header;
