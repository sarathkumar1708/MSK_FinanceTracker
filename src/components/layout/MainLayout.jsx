
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Header from "./Header";
import Sidebar from "./Sidebar";
import { authService } from "../../services/authService";
import { clearAuth  } from "../../features/auth/authSlice";

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Adjust this selector according to your authSlice structure
  const currentUser = useSelector((state) => state.auth.user);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();

      dispatch(clearAuth ());

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
        user={currentUser}
      />

      <div className="main-section">
        <Header
          onMenuClick={toggleSidebar}
          onLogout={handleLogout}
          user={currentUser}
        />

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
