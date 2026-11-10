
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

async function recalculateRemainingTenure(debtId, userId) {
    const { data: debt, error: debtError } = await supabase
        .from(DEBTS_TABLE)
        .select("*")
        .eq("id", debtId)
        .eq("user_id", userId)
        .single();

    throwIfError(debtError);

    const totalTenure = Number(debt.tenure_months) || 0;

    // Preserve the requested rule for loans with zero total tenure.
    if (totalTenure <= 0) {
        if (Number(debt.remaining_tenure_months) !== 0) {
            const { data: updatedDebt, error } = await supabase
                .from(DEBTS_TABLE)
                .update({
                    remaining_tenure_months: 0,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", debtId)
                .eq("user_id", userId)
                .select("*")
                .single();

            throwIfError(error);
            return updatedDebt;
        }

        return debt;
    }

    const { data: snapshots, error: snapshotError } = await supabase
        .from(SNAPSHOTS_TABLE)
        .select("*")
        .eq("debt_id", debtId)
        .eq("user_id", userId)
        .order("month", { ascending: false })
        .limit(1);

    throwIfError(snapshotError);

    const latestSnapshot = snapshots?.[0];

    // Without a monthly balance, interest rate and EMI,
    // retain the existing tenure rather than inventing a value.
    if (!latestSnapshot) return debt;

    const outstanding = Number(latestSnapshot.closing_outstanding);
    const annualRate = Number(latestSnapshot.interest_rate);
    const emi = Number(
        latestSnapshot.emi_amount ?? debt.monthly_emi
    );

    if (
        !Number.isFinite(outstanding) ||
        !Number.isFinite(annualRate) ||
        !Number.isFinite(emi) ||
        outstanding < 0 ||
        annualRate < 0 ||
        emi <= 0
    ) {
        return debt;
    }

    let remainingTenure = 0;

    if (outstanding > 0) {
        const monthlyRate = annualRate / 1200;

        if (monthlyRate === 0) {
            remainingTenure = Math.ceil(outstanding / emi);
        } else {
            const monthlyInterest = outstanding * monthlyRate;

            // EMI must exceed the monthly interest,
            // otherwise the principal will not reduce.
            if (emi <= monthlyInterest) {
                return debt;
            }

            const months =
                -Math.log(
                    1 - (monthlyRate * outstanding) / emi
                ) / Math.log(1 + monthlyRate);

            remainingTenure = Math.max(
                0,
                Math.ceil(months - 1e-10)
            );
        }
    }

    const { data: updatedDebt, error: updateError } = await supabase
        .from(DEBTS_TABLE)
        .update({
            monthly_emi: emi,
            remaining_tenure_months: remainingTenure,
            updated_at: new Date().toISOString(),
        })
        .eq("id", debtId)
        .eq("user_id", userId)
        .select("*")
        .single();

    throwIfError(updateError);

    // Keep the latest snapshot consistent with the calculated tenure.
    const { error: snapshotUpdateError } = await supabase
        .from(SNAPSHOTS_TABLE)
        .update({
            remaining_tenure_months: remainingTenure,
        })
        .eq("id", latestSnapshot.id)
        .eq("user_id", userId);

    throwIfError(snapshotUpdateError);

    return updatedDebt;
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

        // Recalculate each debt independently.
        // One failed calculation must not hide all debts.
        const updatedDebts = await Promise.all(
            (data || []).map(async (debt) => {
                try {
                    return await recalculateRemainingTenure(
                        debt.id,
                        userId
                    );
                } catch (error) {
                    console.error(
                        `Remaining tenure calculation failed for debt ${debt.id}:`,
                        error
                    );

                    // Preserve the original debt information.
                    return debt;
                }
            })
        );

        return updatedDebts;
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

        // Recalculate using the latest monthly outstanding,
        // interest rate and EMI.
        const updatedDebt = await recalculateRemainingTenure(
            payload.debt_id,
            userId
        );

        return {
            snapshot: {
                ...data,
                remaining_tenure_months:
                    updatedDebt.remaining_tenure_months,
            },
            debt: updatedDebt,
        };
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
