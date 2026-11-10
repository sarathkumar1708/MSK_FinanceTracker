
import { supabase } from "../../../lib/supabase";

const GOALS_TABLE = "goals";

const getCurrentUserId = async () => {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) throw error;

    if (!user) {
        throw new Error("Please log in to manage your goals.");
    }

    return user.id;
};

const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const goalService = {
    // Fetch all goals for the logged-in user
    getAll: async () => {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from(GOALS_TABLE)
            .select("*")
            .eq("user_id", userId)
            .order("start_date", { ascending: false });

        if (error) throw error;

        return data || [];
    },

    // Create a new goal
    create: async (goalData) => {
        const userId = await getCurrentUserId();

        const payload = {
            goal_name: goalData.goal_name.trim(),
            goal_type: goalData.goal_type,
            status: "pending",
            start_date: goalData.start_date,
            closing_date: null,
            user_id: userId,
        };

        const { data, error } = await supabase
            .from(GOALS_TABLE)
            .insert(payload)
            .select()
            .single();

        if (error) throw error;

        return data;
    },

    // Update an existing goal
    update: async (id, updates) => {
        await getCurrentUserId();

        const payload = {
            ...updates,
            updated_at: new Date().toISOString(),
        };

        if (updates.status === "completed") {
            payload.closing_date = updates.closing_date || getToday();
        }

        if (updates.status === "pending") {
            payload.closing_date = null;
        }

        // Do not allow changing ownership through an update
        delete payload.user_id;

        const { data, error } = await supabase
            .from(GOALS_TABLE)
            .update(payload)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return data;
    },

    // Delete a goal
    delete: async (id) => {
        await getCurrentUserId();

        const { error } = await supabase
            .from(GOALS_TABLE)
            .delete()
            .eq("id", id);

        if (error) throw error;

        return id;
    },
};

export default goalService;
