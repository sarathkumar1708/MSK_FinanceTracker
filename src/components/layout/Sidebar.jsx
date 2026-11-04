
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  Wallet,
  UserRound,
  House,
  CreditCard,
  PiggyBank,
  Landmark,
  CalendarDays,
  Bookmark,
  ChevronDown,
  X,
  LayoutDashboard,
} from "lucide-react";

import { navigationItems } from "../../config/navigation";
import {
  selectIsAdmin,
  selectPermissionKeys,
  selectPermissionLoading,
} from "../../features/permissions/permissionSlice";

const iconMap = {
  Wallet,
  UserRound,
  House,
  CreditCard,
  PiggyBank,
  Landmark,
  CalendarDays,
  Bookmark,
};

function Sidebar({ isOpen, closeSidebar }) {
  const location = useLocation();

  const isAdmin = useSelector(selectIsAdmin);
  const permissionKeys = useSelector(selectPermissionKeys);
  const permissionLoading = useSelector(selectPermissionLoading);

  const [expandedMenus, setExpandedMenus] = useState({
    finance: true,
  });


  const visibleItems = useMemo(() => {
    if (permissionLoading) return [];
  
    if (isAdmin) return navigationItems;
  
    const permissions = Array.isArray(permissionKeys)
      ? permissionKeys
      : [];
  
    const hasPermission = (key) =>
      permissions.includes("*") || permissions.includes(key);
  
    return navigationItems.reduce((result, item) => {
      if (item.adminOnly) return result;
  
      if (item.children) {
        const allowedChildren = item.children.filter(
          (child) => !child.adminOnly && hasPermission(child.componentKey)
        );
  
        if (allowedChildren.length > 0) {
          result.push({ ...item, children: allowedChildren });
        }
      } else if (hasPermission(item.componentKey)) {
        result.push(item);
      }
  
      return result;
    }, []);
  }, [isAdmin, permissionKeys, permissionLoading]);
  

  useEffect(() => {
    const activeParent = visibleItems.find((item) =>
      item.children?.some(
        (child) => child.path === location.pathname
      )
    );

    if (activeParent) {
      setExpandedMenus((prev) => ({
        ...prev,
        [activeParent.id]: true,
      }));
    }
  }, [location.pathname, visibleItems]);

  const toggleMenu = (menuId) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const renderIcon = (iconName, size = 19) => {
    const Icon = iconMap[iconName];
    return Icon ? <Icon size={size} /> : null;
  };

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">
              <LayoutDashboard size={22} />
            </div>
            <span>Personal Tracker</span>
          </div>

          <button
            className="mobile-close"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        </div>

        <div className="sidebar-section-label">
          WORKSPACE
        </div>

        <nav className="sidebar-navigation">
          {permissionLoading ? (
            <p className="sidebar-loading">Loading menu...</p>
          ) : (
            visibleItems.map((item) => {
              const isExpanded = expandedMenus[item.id];

              const hasActiveChild = item.children?.some(
                (child) => child.path === location.pathname
              );

              return (
                <div className="nav-group" key={item.id}>
                  {item.children ? (
                    <>
                      <button
                        className={`nav-parent ${
                          hasActiveChild ? "parent-active" : ""
                        }`}
                        onClick={() => toggleMenu(item.id)}
                      >
                        <span className="nav-icon">
                          {renderIcon(item.icon)}
                        </span>

                        <span className="nav-title">
                          {item.title}
                        </span>

                        <ChevronDown
                          className={`nav-chevron ${
                            isExpanded ? "rotated" : ""
                          }`}
                          size={16}
                        />
                      </button>

                      {isExpanded && (
                        <div className="submenu">
                          {item.children.map((child) => (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              onClick={closeSidebar}
                              className={({ isActive }) =>
                                `submenu-link ${
                                  isActive ? "submenu-active" : ""
                                }`
                              }
                            >
                              <span className="submenu-dot" />
                              {child.title}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <NavLink
                      to={item.path}
                      onClick={closeSidebar}
                      className={({ isActive }) =>
                        `nav-parent ${
                          isActive ? "nav-active" : ""
                        }`
                      }
                    >
                      <span className="nav-icon">
                        {renderIcon(item.icon)}
                      </span>

                      <span className="nav-title">
                        {item.title}
                      </span>
                    </NavLink>
                  )}
                </div>
              );
            })
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar">S</div>

          <div className="user-info">
            <strong>My Workspace</strong>
            <span>{isAdmin ? "Administrator" : "Personal Account"}</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
