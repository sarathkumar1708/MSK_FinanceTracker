
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { supabase } from "../../lib/supabase";

import {
  setSession,
  setAuthError,
} from "./authSlice";

import { fetchMyPermissions, clearPermissions } from "../permissions/permissionSlice";

export default function AuthListener({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    let mounted = true;

    // Restore existing session
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;

      if (error) {
        dispatch(setAuthError(error.message));
        dispatch(clearPermissions());
        return;
      }

      const session = data.session;

      dispatch(setSession(session));

      if (session?.user?.id) {
        dispatch(fetchMyPermissions());
      } else {
        dispatch(clearPermissions());
      }
    });

    // Listen for login/logout events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      dispatch(setSession(session));

      if (session?.user?.id) {
        // Load permissions after login
        dispatch(fetchMyPermissions());
      } else {
        // Clear permissions after logout
        dispatch(clearPermissions());
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return children;
}
