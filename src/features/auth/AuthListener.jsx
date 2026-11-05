import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

import { supabase } from "../../lib/supabase";

import { setSession } from "./authSlice";
import {
  fetchMyPermissions,
  clearPermissions,
} from "../permissions/permissionSlice";

export default function AuthListener({ children }) {
  const dispatch = useDispatch();
  const lastUserId = useRef(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const userId = session?.user?.id ?? null;

      // Temporary debugging
      console.log("Supabase Auth Event:", event, {
        userId,
        hasSession: Boolean(session),
      });

      // Update the current session
      dispatch(setSession(session));

      if (userId) {
        // Fetch permissions only when the authenticated user changes.
        if (lastUserId.current !== userId) {
          lastUserId.current = userId;
          dispatch(fetchMyPermissions());
        }
      } else {
        lastUserId.current = null;
        dispatch(clearPermissions());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return children;
}