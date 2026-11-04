
import { supabase } from "../lib/supabase";

async function getCurrentUser() {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) throw error;
    if (!user) throw new Error("User not authenticated");

    return user;
}

export const categoryService = {
    async getByType(type) {
        const { data, error } = await supabase
            .from("categories")
            .select(`
            id,
            name,
            type,
            subcategories (
              id,
              name,
              category_id
            )
          `)
            .is("user_id", null)
            .eq("type", type)
            .order("name");

        if (error) throw error;

        return data || [];
    },

    async getNavigationCategories() {
        const { data, error } = await supabase
            .from("categories")
            .select(`
            id,
            name,
            type,
            subcategories (
              id,
              name,
              category_id
            )
          `)
            .is("user_id", null)
            .eq("type", "navigation")
            .order("name");

        if (error) throw error;

        return data || [];
    },

    async create(name, type) {
        const user = await getCurrentUser();

        const { data, error } = await supabase
            .from("categories")
            .insert({
                name,
                type,
                user_id: user.id,
            })
            .select()
            .single();

        if (error) throw error;

        return {
            ...data,
            subcategories: [],
        };
    },

    async createSubcategory(name, categoryId) {
        const { data, error } = await supabase
            .from("subcategories")
            .insert({
                name,
                category_id: categoryId,
            })
            .select()
            .single();

        if (error) throw error;

        return data;
    },
};
