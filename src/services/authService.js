
import { supabase } from "../lib/supabase";

export const authService = {
  async signInWithGoogle() {
    const redirectUrl = import.meta.env.PROD
      ? "https://msk-finance-tracker.vercel.app//finance/daily-spending"
      : "http://localhost:5173//finance/daily-spending";

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) throw error;

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
};