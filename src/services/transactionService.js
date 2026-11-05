
import { supabase } from "../lib/supabase";

// Convert frontend transaction data into Supabase columns.
const toDatabase = (entry) => ({
    type: entry.type,

    category_id:
        entry.categoryId ?? entry.category_id ?? null,

    subcategory_id:
        entry.subcategoryId ?? entry.subcategory_id ?? null,

    amount_minor:
        entry.amount_minor !== undefined
            ? Number(entry.amount_minor)
            : Math.round(Number(entry.amount) * 100),

    description:
        entry.title ?? entry.description ?? "",

    transaction_date:
        entry.date ?? entry.transaction_date,

    updated_at: new Date().toISOString(),
    notes: entry.notes ?? "",
});

// Convert Supabase data into frontend transaction format.
const fromDatabase = (item) => ({
    ...item,

    amount: Number(item.amount_minor) / 100,

    categoryId: item.category_id,
    subcategoryId: item.subcategory_id,

    category: item.categories?.name ?? "",
    subcategory: item.subcategories?.name ?? "",

    title: item.description ?? "",
    notes: item.notes ?? "",

    date: item.transaction_date,
});

const transactionSelect = `
  *,
  categories (
    name
  ),
  subcategories (
    name
  )
`;

export const transactionService = {
    // Get currently logged-in user.
    async getCurrentUser() {
        const {
            data: { user },
            error
        } = await supabase.auth.getUser();

        if (error) throw error;

        if (!user) {
            throw new Error("User not authenticated");
        }

        return user;
    },

    async getAll({ startDate, endDate } = {}) {
        const user = await this.getCurrentUser();

        let query = supabase
            .from("transactions")
            .select(transactionSelect)
            .eq("user_id", user.id);

        // Apply month filter when dates are provided
        if (startDate && endDate) {
            query = query
                .gte("transaction_date", startDate)
                .lt("transaction_date", endDate);
        }

        const { data, error } = await query
            .order("transaction_date", { ascending: false })
            .order("created_at", { ascending: false });

        if (error) throw error;

        return (data || []).map(fromDatabase);
    },

    // Add expense or income.
    async create(entry) {
        const user = await this.getCurrentUser();

        const { data, error } = await supabase
            .from("transactions")
            .insert({
                ...toDatabase(entry),
                user_id: user.id
            })
            .select(transactionSelect)
            .single();

        if (error) throw error;

        return fromDatabase(data);
    },

    // Update existing expense or income.
    async update(id, transaction) {
        const user = await this.getCurrentUser();

        if (!id) {
            throw new Error("Transaction ID is required for update");
        }

        const payload = toDatabase(transaction);

        const { data, error } = await supabase
            .from("transactions")
            .update(payload)
            .eq("id", id)
            .eq("user_id", user.id)
            .select(transactionSelect)
            .single();

        if (error) throw error;

        return fromDatabase(data);
    },

    // Delete transaction.
    async delete(id) {
        const user = await this.getCurrentUser();

        const { error } = await supabase
            .from("transactions")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) throw error;
    }
};
