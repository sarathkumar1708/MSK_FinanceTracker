import { useState } from "react";
import { useDispatch } from "react-redux";

import { authService } from "../../services/authService";
import { setAuthError } from "../../features/auth/authSlice";
import "./Login.css";

export default function Login() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      await authService.signInWithGoogle();

    } catch (error) {
      dispatch(setAuthError(error.message));
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Expense Tracker</h1>

        <p>Manage your money, simply.</p>

        <h2>Welcome back</h2>

        <p>Sign in to continue</p>

        <button onClick={handleGoogleLogin} disabled={loading}>
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt=""
            width="20"
            height="20"
          />
          {loading ? "Redirecting..." : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}