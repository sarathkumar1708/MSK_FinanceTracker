import { supabase } from "../lib/supabase";

export const authService = {
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
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