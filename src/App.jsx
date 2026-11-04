import { useSelector } from "react-redux";

// import Dashboard from "./pages/Dashboard";
import AuthListener from "./features/auth/AuthListener";
import AppRoutes from "./routes/AppRoutes";
import Login from "./pages/Login/Login";

function AppContent() {
  const { user, loading } = useSelector(
    (state) => state.auth
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return <AppRoutes />;
}

export default function App() {
  return (
    <AuthListener>
      <AppContent />
    </AuthListener>
  );
}