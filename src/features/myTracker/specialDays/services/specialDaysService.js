import { supabase } from "../../../../lib/supabase";



const TABLE_NAME = "special_days";

const getCurrentUser = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) throw error;

    if (!data?.user) {
        throw new Error("User session not found. Please log in again.");
    }

    return data.user;
};

// Fetch all special days for the logged-in user
const getSpecialDays = async () => {
    try {
        const user = await getCurrentUser();

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .eq("user_id", user.id)
            .order("event_date", { ascending: true });

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error("Error fetching special days:", error);
        throw error;
    }
};

// Create a special day
const createSpecialDay = async (specialDayData) => {
    try {
        const user = await getCurrentUser();

        const payload = {
            user_id: user.id,
            title: specialDayData.title.trim(),
            event_date: specialDayData.event_date,
            category: specialDayData.category || "other",
            remarks: specialDayData.remarks?.trim() || null,
        };

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([payload])
            .select()
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error("Error creating special day:", error);
        throw error;
    }
};

// Update an existing special day
const updateSpecialDay = async ({ id, ...specialDayData }) => {
    try {
        const user = await getCurrentUser();

        const payload = {
            title: specialDayData.title.trim(),
            event_date: specialDayData.event_date,
            category: specialDayData.category || "other",
            remarks: specialDayData.remarks?.trim() || null,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(payload)
            .eq("id", id)
            .eq("user_id", user.id)
            .select()
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error("Error updating special day:", error);
        throw error;
    }
};

// Delete a special day
const deleteSpecialDay = async (id) => {
    try {
        const user = await getCurrentUser();

        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) throw error;

        return id;
    } catch (error) {
        console.error("Error deleting special day:", error);
        throw error;
    }
};

export const specialDaysService = {
    getSpecialDays,
    createSpecialDay,
    updateSpecialDay,
    deleteSpecialDay,
};
