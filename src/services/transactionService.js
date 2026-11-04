import { supabase } from "../lib/supabase";

export const transactionService = {
    async getAll() {
        // Get the currently logged-in user
        const { data: { user }, error: userError } =
            await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
            throw new Error("User not authenticated");
        }

        // Fetch only this user's transactions
        const { data, error } = await supabase
            .from("transactions")
            .select("*")
            .eq("user_id", user.id)
            .order("transaction_date", { ascending: false });

        if (error) throw error;

        return data;
    },
};