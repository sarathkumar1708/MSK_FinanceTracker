
import { supabase } from "../../../lib/supabase";

const DEBTS_TABLE = "debts";
const SNAPSHOTS_TABLE = "debt_monthly_snapshots";
const PAYMENTS_TABLE = "debt_payments";

async function getCurrentUserId() {
    const { data, error } = await supabase.auth.getUser();

    if (error) throw error;

    if (!data.user) {
        throw new Error("You must be logged in to manage debts.");
    }

    return data.user.id;
}

function throwIfError(error) {
    if (error) throw error;
}

export const debtService = {
    // =====================================
    // DEBTS
    // =====================================

    async getAll() {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from(DEBTS_TABLE)
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        throwIfError(error);
        return data ?? [];
    },

    async getById(id) {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from(DEBTS_TABLE)
            .select("*")
            .eq("id", id)
            .eq("user_id", userId)
            .single();

        throwIfError(error);
        return data;
    },

    async create(payload) {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from(DEBTS_TABLE)
            .insert({
                ...payload,
                user_id: userId,
            })
            .select()
            .single();

        throwIfError(error);
        return data;
    },

    async update(id, payload) {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from(DEBTS_TABLE)
            .update({
                ...payload,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .eq("user_id", userId)
            .select()
            .single();

        throwIfError(error);
        return data;
    },

    // Prefer closing a debt to deleting its history.
    async close(id) {
        return this.update(id, { status: "closed" });
    },

    // Permanently delete a debt and its related records.
    async delete(id) {
        const userId = await getCurrentUserId();

        // 1. Delete payment records
        const { error: paymentError } = await supabase
            .from(PAYMENTS_TABLE)
            .delete()
            .eq("debt_id", id)
            .eq("user_id", userId);

        throwIfError(paymentError);

        // 2. Delete monthly snapshots
        const { error: snapshotError } = await supabase
            .from(SNAPSHOTS_TABLE)
            .delete()
            .eq("debt_id", id)
            .eq("user_id", userId);

        throwIfError(snapshotError);

        // 3. Delete the debt
        const { data, error: debtError } = await supabase
            .from(DEBTS_TABLE)
            .delete()
            .eq("id", id)
            .eq("user_id", userId)
            .select()
            .single();

        throwIfError(debtError);

        if (!data) {
            throw new Error("Debt not found or you do not have permission to delete it.");
        }

        return id;
    },

    // =====================================
    // MONTHLY SNAPSHOTS
    // =====================================

    async getSnapshots({ debtId, month, from, to } = {}) {
        const userId = await getCurrentUserId();

        let query = supabase
            .from(SNAPSHOTS_TABLE)
            .select("*")
            .eq("user_id", userId);

        if (debtId) query = query.eq("debt_id", debtId);
        if (month) query = query.eq("month", month);
        if (from) query = query.gte("month", from);
        if (to) query = query.lte("month", to);

        const { data, error } = await query.order("month", {
            ascending: false,
        });

        throwIfError(error);
        return data ?? [];
    },

    async saveSnapshot(payload) {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from(SNAPSHOTS_TABLE)
            .upsert(
                {
                    ...payload,
                    user_id: userId,
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: "debt_id,month",
                }
            )
            .select()
            .single();

        throwIfError(error);
        return data;
    },

    async deleteSnapshot(id) {
        const userId = await getCurrentUserId();

        const { error } = await supabase
            .from(SNAPSHOTS_TABLE)
            .delete()
            .eq("id", id)
            .eq("user_id", userId);

        throwIfError(error);
        return id;
    },

    // =====================================
    // PAYMENTS
    // =====================================

    async getPayments({ debtId, from, to } = {}) {
        const userId = await getCurrentUserId();

        let query = supabase
            .from(PAYMENTS_TABLE)
            .select("*")
            .eq("user_id", userId);

        if (debtId) query = query.eq("debt_id", debtId);
        if (from) query = query.gte("paid_date", from);
        if (to) query = query.lte("paid_date", to);

        const { data, error } = await query.order("paid_date", {
            ascending: false,
        });

        throwIfError(error);
        return data ?? [];
    },

    // =========================================
    // ACTIVITY LOGS
    // =========================================

    async getActivityLogs({ limit = 100, entityType = null } = {}) {
        const userId = await getCurrentUserId();

        let query = supabase
            .from("activity_logs")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (entityType) {
            query = query.eq("entity_type", entityType);
        }

        const { data, error } = await query;

        throwIfError(error);

        return data || [];
    },

    async createPayment(payload) {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from(PAYMENTS_TABLE)
            .insert({
                ...payload,
                user_id: userId,
            })
            .select()
            .single();

        throwIfError(error);
        return data;
    },

    async updatePayment(id, payload) {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from(PAYMENTS_TABLE)
            .update({
                ...payload,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .eq("user_id", userId)
            .select()
            .single();

        throwIfError(error);
        return data;
    },

    async deletePayment(id) {
        const userId = await getCurrentUserId();

        const { error } = await supabase
            .from(PAYMENTS_TABLE)
            .delete()
            .eq("id", id)
            .eq("user_id", userId);

        throwIfError(error);
        return id;
    },
};
