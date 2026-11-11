
import { supabase } from "../../../lib/supabase";

/* =====================================================
   AUTHENTICATED USER
===================================================== */

const getCurrentUserId = async () => {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) throw error;

    if (!user) {
        throw new Error("Please log in to access the Budget Planner.");
    }

    return user.id;
};

/* =====================================================
   BUDGET SERVICE
===================================================== */

const budgetService = {

    /* =================================================
       GET YEAR OVERVIEW
    ================================================= */

    async getYearOverview(year) {
        const userId = await getCurrentUserId();

        const { data: months, error: monthError } = await supabase
            .from("budget_months")
            .select("*")
            .eq("user_id", userId)
            .eq("budget_year", Number(year))
            .order("budget_month", { ascending: true });

        if (monthError) throw monthError;

        const monthIds = (months || []).map((item) => item.id);

        if (monthIds.length === 0) {
            return {
                months: [],
                incomes: [],
                budgetItems: [],
            };
        }

        const [
            { data: incomes, error: incomeError },
            { data: budgetItems, error: budgetError },
        ] = await Promise.all([
            supabase
                .from("budget_incomes")
                .select("*")
                .in("budget_month_id", monthIds),

            supabase
                .from("budget_items")
                .select(`
                    *,
                    category:budget_categories (
                        id,
                        name,
                        category_group
                    )
                `)
                .in("budget_month_id", monthIds),
        ]);

        if (incomeError) throw incomeError;
        if (budgetError) throw budgetError;

        return {
            months: months || [],
            incomes: incomes || [],
            budgetItems: budgetItems || [],
        };
    },

    /* =================================================
       GET OR CREATE MONTH
    ================================================= */

    async getOrCreateMonth(year, month) {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from("budget_months")
            .upsert(
                {
                    user_id: userId,
                    budget_year: Number(year),
                    budget_month: Number(month),
                },
                {
                    onConflict: "user_id,budget_year,budget_month",
                }
            )
            .select()
            .single();

        if (error) throw error;

        return data;
    },

    /* =================================================
       GET MONTH DETAILS
    ================================================= */

    async getMonthDetails(year, month) {
        const budgetMonth = await this.getOrCreateMonth(year, month);

        const [
            { data: incomes, error: incomeError },
            { data: budgetItems, error: budgetError },
        ] = await Promise.all([
            supabase
                .from("budget_incomes")
                .select("*")
                .eq("budget_month_id", budgetMonth.id)
                .order("created_at", { ascending: true }),

            supabase
                .from("budget_items")
                .select(`
                    *,
                    category:budget_categories (
                        id,
                        name,
                        category_group
                    )
                `)
                .eq("budget_month_id", budgetMonth.id)
                .order("created_at", { ascending: true }),
        ]);

        if (incomeError) throw incomeError;
        if (budgetError) throw budgetError;

        return {
            month: budgetMonth,
            incomes: incomes || [],
            budgetItems: budgetItems || [],
        };
    },

    /* =================================================
       GET AVAILABLE CATEGORIES
    ================================================= */

    async getCategories() {
        const { data, error } = await supabase
            .from("budget_categories")
            .select("*")
            .eq("is_active", true)
            .order("sort_order", { ascending: true });

        if (error) throw error;

        return data || [];
    },

    /* =================================================
       CREATE CUSTOM CATEGORY
    ================================================= */

    async createCategory(payload) {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from("budget_categories")
            .insert({
                user_id: userId,
                category_group: payload.category_group,
                name: payload.name.trim(),
                sort_order: payload.sort_order || 100,
            })
            .select()
            .single();

        if (error) throw error;

        return data;
    },

    /* =================================================
       UPDATE CUSTOM CATEGORY
    ================================================= */

    async updateCategory(id, updates) {
        const userId = await getCurrentUserId();

        const updateData = {};

        if (updates.category_group !== undefined) {
            updateData.category_group = updates.category_group;
        }

        if (updates.name !== undefined) {
            updateData.name = updates.name.trim();
        }

        const { data, error } = await supabase
            .from("budget_categories")
            .update(updateData)
            .eq("id", id)
            .eq("user_id", userId)
            .select()
            .single();

        if (error) throw error;

        return data;
    },

    /* =================================================
       DELETE CUSTOM CATEGORY
    ================================================= */

    async deleteCategory(id) {
        const userId = await getCurrentUserId();

        const { error } = await supabase
            .from("budget_categories")
            .delete()
            .eq("id", id)
            .eq("user_id", userId);

        if (error) throw error;

        return id;
    },

    /* =================================================
       CREATE INCOME
       Single amount field
    ================================================= */

    async createIncome(payload) {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from("budget_incomes")
            .insert({
                budget_month_id: payload.budget_month_id,
                user_id: userId,
                income_title: payload.income_title.trim(),
                amount: Number(payload.amount || 0),
                notes: payload.notes || null,
            })
            .select()
            .single();

        if (error) throw error;

        return data;
    },

    /* =================================================
       UPDATE INCOME
    ================================================= */

    async updateIncome(id, updates) {
        const userId = await getCurrentUserId();

        const updateData = {};

        if (updates.income_title !== undefined) {
            updateData.income_title = updates.income_title.trim();
        }

        if (updates.amount !== undefined) {
            updateData.amount = Number(updates.amount);
        }

        if (updates.notes !== undefined) {
            updateData.notes = updates.notes || null;
        }

        const { data, error } = await supabase
            .from("budget_incomes")
            .update(updateData)
            .eq("id", id)
            .eq("user_id", userId)
            .select()
            .single();

        if (error) throw error;

        return data;
    },

    /* =================================================
       DELETE INCOME
    ================================================= */

    async deleteIncome(id) {
        const userId = await getCurrentUserId();

        const { error } = await supabase
            .from("budget_incomes")
            .delete()
            .eq("id", id)
            .eq("user_id", userId);

        if (error) throw error;

        return id;
    },

    /* =================================================
       CREATE BUDGET ITEM
    ================================================= */


    async createBudgetItem(payload) {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from("budget_items")
            .insert({
                budget_month_id: payload.budget_month_id,
                user_id: userId,
                category_id: payload.category_id,
                planned_amount: Number(payload.planned_amount || 0),
                notes: payload.notes || null,
            })
            .select(`
            *,
            category:budget_categories (
                id,
                name,
                category_group
            )
        `)
            .single();

        if (error) throw error;

        return data;
    },


    /* =================================================
       UPDATE BUDGET ITEM
    ================================================= */


    async updateBudgetItem(id, updates) {
        const userId = await getCurrentUserId();

        const updateData = {};

        if (updates.category_id !== undefined) {
            updateData.category_id = updates.category_id;
        }

        if (updates.planned_amount !== undefined) {
            updateData.planned_amount = Number(updates.planned_amount);
        }

        if (updates.notes !== undefined) {
            updateData.notes = updates.notes || null;
        }

        const { data, error } = await supabase
            .from("budget_items")
            .update(updateData)
            .eq("id", id)
            .eq("user_id", userId)
            .select(`
            *,
            category:budget_categories (
                id,
                name,
                category_group
            )
        `)
            .single();

        if (error) throw error;

        return data;
    },


    /* =================================================
       DELETE BUDGET ITEM
    ================================================= */

    async deleteBudgetItem(id) {
        const userId = await getCurrentUserId();

        const { error } = await supabase
            .from("budget_items")
            .delete()
            .eq("id", id)
            .eq("user_id", userId);

        if (error) throw error;

        return id;
    },
};

export default budgetService;
