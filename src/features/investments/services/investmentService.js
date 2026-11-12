
import { supabase } from "../../../lib/supabase";

const INVESTMENTS_TABLE = "investments";
const TRANSACTIONS_TABLE = "investment_transactions";
const SNAPSHOTS_TABLE = "investment_monthly_snapshots";

/* =====================================================
   COMMON HELPERS
===================================================== */

const getCurrentUserId = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) throw error;

    const userId = data?.user?.id;

    if (!userId) {
        throw new Error("User is not authenticated.");
    }

    return userId;
};

const throwIfError = (error) => {
    if (error) throw error;
};

const normalizeMonth = (value) => {
    if (!value) {
        throw new Error("Month is required.");
    }

    const month = String(value).slice(0, 7);

    if (!/^\d{4}-\d{2}$/.test(month)) {
        throw new Error("Invalid month format. Expected YYYY-MM.");
    }

    return `${month}-01`;
};

const getMonthRange = (month) => {
    const start = normalizeMonth(month);
    const [year, monthNumber] = start.split("-").map(Number);

    const nextMonth = new Date(year, monthNumber, 1);
    const end = `${nextMonth.getFullYear()}-${String(
        nextMonth.getMonth() + 1
    ).padStart(2, "0")}-01`;

    return { start, end };
};

const sortTransactions = (transactions) => {
    return [...transactions].sort((a, b) => {
        const dateComparison =
            String(a.transaction_date).localeCompare(
                String(b.transaction_date)
            );

        if (dateComparison !== 0) return dateComparison;

        const createdComparison =
            String(a.created_at || "").localeCompare(
                String(b.created_at || "")
            );

        if (createdComparison !== 0) return createdComparison;

        return String(a.id).localeCompare(String(b.id));
    });
};

const validateTransaction = (transaction) => {
    const amount = Number(transaction.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Transaction amount must be greater than zero.");
    }

    if (
        !["CONTRIBUTION", "WITHDRAWAL"].includes(
            transaction.transaction_type
        )
    ) {
        throw new Error(
            "Transaction type must be CONTRIBUTION or WITHDRAWAL."
        );
    }

    if (!transaction.transaction_date) {
        throw new Error("Transaction date is required.");
    }

    return amount;
};

/* =====================================================
   AUTHENTICATION / INVESTMENT HELPERS
===================================================== */

const getInvestmentForUser = async (investmentId, userId) => {
    const { data, error } = await supabase
        .from(INVESTMENTS_TABLE)
        .select("*")
        .eq("id", investmentId)
        .eq("user_id", userId)
        .single();

    throwIfError(error);

    return data;
};

const getInvestmentTransactions = async (
    investmentId,
    userId
) => {
    const { data, error } = await supabase
        .from(TRANSACTIONS_TABLE)
        .select("*")
        .eq("investment_id", investmentId)
        .eq("user_id", userId);

    throwIfError(error);

    return sortTransactions(data || []);
};

/* =====================================================
   BALANCE VALIDATION
===================================================== */

const calculateTransactionBalances = (transactions) => {
    let balance = 0;

    return sortTransactions(transactions).map((transaction) => {
        const amount = Number(transaction.amount);

        if (transaction.transaction_type === "CONTRIBUTION") {
            balance += amount;
        } else {
            balance -= amount;
        }

        if (balance < -0.001) {
            throw new Error(
                `Insufficient investment balance for withdrawal dated ${transaction.transaction_date}.`
            );
        }

        balance = Math.max(0, balance);

        return {
            ...transaction,
            balance_after_transaction: Number(balance.toFixed(2)),
        };
    });
};

/* =====================================================
   RECALCULATE TRANSACTION BALANCES
===================================================== */

const recalculateTransactionBalances = async (
    investmentId,
    userId
) => {
    const transactions = await getInvestmentTransactions(
        investmentId,
        userId
    );

    const recalculated = calculateTransactionBalances(transactions);

    for (const transaction of recalculated) {
        const { error } = await supabase
            .from(TRANSACTIONS_TABLE)
            .update({
                balance_after_transaction:
                    transaction.balance_after_transaction,
                updated_at: new Date().toISOString(),
            })
            .eq("id", transaction.id)
            .eq("investment_id", investmentId)
            .eq("user_id", userId);

        throwIfError(error);
    }

    return recalculated;
};

/* =====================================================
   REFRESH EXISTING MONTHLY SNAPSHOT
===================================================== */

const refreshExistingMonthlySnapshot = async (
    investmentId,
    userId,
    month
) => {
    const normalizedMonth = normalizeMonth(month);

    const { data: existingSnapshot, error } = await supabase
        .from(SNAPSHOTS_TABLE)
        .select("*")
        .eq("investment_id", investmentId)
        .eq("user_id", userId)
        .eq("month", normalizedMonth)
        .maybeSingle();

    throwIfError(error);

    // Do not create a snapshot automatically.
    if (!existingSnapshot) return null;

    return await investmentService.saveSnapshot({
        investment_id: investmentId,
        month: normalizedMonth,
        current_market_value:
            existingSnapshot.current_market_value,
        notes: existingSnapshot.notes,
    });
};

/* =====================================================
   INVESTMENT SERVICE
===================================================== */

const investmentService = {

    /* ================================================
       1. GET ALL INVESTMENTS
    ================================================ */

    async getAll() {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from(INVESTMENTS_TABLE)
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        throwIfError(error);

        return data || [];
    },

    /* ================================================
       2. GET INVESTMENT BY ID
    ================================================ */

    async getById(id) {
        const userId = await getCurrentUserId();

        return await getInvestmentForUser(id, userId);
    },

    /* ================================================
       3. CREATE INVESTMENT
    ================================================ */

    async create(payload) {
        const userId = await getCurrentUserId();

        if (!payload?.name?.trim()) {
            throw new Error("Investment name is required.");
        }

        if (!payload?.investment_type) {
            throw new Error("Investment type is required.");
        }

        const investmentPayload = {
            name: payload.name.trim(),
            investment_type: payload.investment_type,
            provider: payload.provider || null,
            account_number_last4:
                payload.account_number_last4 || null,
            start_date: payload.start_date || null,
            target_amount:
                payload.target_amount === "" ||
                    payload.target_amount == null
                    ? null
                    : Number(payload.target_amount),
            monthly_contribution:
                payload.monthly_contribution === "" ||
                    payload.monthly_contribution == null
                    ? null
                    : Number(payload.monthly_contribution),
            notes: payload.notes || null,
            status: payload.status || "active",
            user_id: userId,
        };

        const { data, error } = await supabase
            .from(INVESTMENTS_TABLE)
            .insert(investmentPayload)
            .select()
            .single();

        throwIfError(error);

        return data;
    },

    /* ================================================
       4. UPDATE INVESTMENT
    ================================================ */

    async update(id, updates) {
        const userId = await getCurrentUserId();

        const updatePayload = {
            ...updates,
            updated_at: new Date().toISOString(),
        };

        delete updatePayload.id;
        delete updatePayload.user_id;
        delete updatePayload.created_at;

        const { data, error } = await supabase
            .from(INVESTMENTS_TABLE)
            .update(updatePayload)
            .eq("id", id)
            .eq("user_id", userId)
            .select()
            .single();

        throwIfError(error);

        return data;
    },

    /* ================================================
       5. DELETE INVESTMENT
    ================================================ */
    async delete(id) {
        const userId = await getCurrentUserId();

        // Confirm that this investment belongs to the logged-in user.
        await getInvestmentForUser(id, userId);

        // Delete snapshots first because they reference the investment.
        const { error: snapshotError } = await supabase
            .from(SNAPSHOTS_TABLE)
            .delete()
            .eq("investment_id", id)
            .eq("user_id", userId);

        throwIfError(snapshotError);

        // Delete all associated contributions and withdrawals.
        const { error: transactionError } = await supabase
            .from(TRANSACTIONS_TABLE)
            .delete()
            .eq("investment_id", id)
            .eq("user_id", userId);

        throwIfError(transactionError);

        // Finally, permanently delete the investment.
        const { error: investmentError } = await supabase
            .from(INVESTMENTS_TABLE)
            .delete()
            .eq("id", id)
            .eq("user_id", userId);

        throwIfError(investmentError);

        return id;
    },

    /* ================================================
       6. CLOSE INVESTMENT
    ================================================ */

    async close(id) {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from(INVESTMENTS_TABLE)
            .update({
                status: "closed",
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .eq("user_id", userId)
            .select()
            .single();

        throwIfError(error);

        return data;
    },

    async activate(id) {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from(INVESTMENTS_TABLE)
            .update({
                status: "active",
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .eq("user_id", userId)
            .select()
            .single();

        throwIfError(error);

        return data;
    },

    /* ================================================
       7. GET ALL TRANSACTIONS
    ================================================ */

    async getTransactions(investmentId = null) {
        const userId = await getCurrentUserId();

        let query = supabase
            .from(TRANSACTIONS_TABLE)
            .select("*")
            .eq("user_id", userId)
            .order("transaction_date", { ascending: false })
            .order("created_at", { ascending: false });

        if (investmentId) {
            query = query.eq("investment_id", investmentId);
        }

        const { data, error } = await query;

        throwIfError(error);

        return data || [];
    },

    /* ================================================
       8. CREATE CONTRIBUTION / WITHDRAWAL
    ================================================ */

    async createTransaction(payload) {
        const userId = await getCurrentUserId();

        const investmentId = payload?.investment_id;

        if (!investmentId) {
            throw new Error("Investment is required.");
        }

        await getInvestmentForUser(investmentId, userId);

        validateTransaction(payload);

        const existingTransactions =
            await getInvestmentTransactions(investmentId, userId);

        const newTransaction = {
            ...payload,
            amount: Number(payload.amount),
        };

        // Validate the complete ledger before inserting.
        calculateTransactionBalances([
            ...existingTransactions,
            newTransaction,
        ]);

        const { data, error } = await supabase
            .from(TRANSACTIONS_TABLE)
            .insert({
                investment_id: investmentId,
                user_id: userId,
                transaction_type: payload.transaction_type,
                amount: Number(payload.amount),
                transaction_date: payload.transaction_date,
                notes: payload.notes || null,
            })
            .select()
            .single();

        throwIfError(error);

        const transactions = await recalculateTransactionBalances(
            investmentId,
            userId
        );

        await refreshExistingMonthlySnapshot(
            investmentId,
            userId,
            payload.transaction_date
        );

        return (
            transactions.find((item) => item.id === data.id) || data
        );
    },

    /* ================================================
       9. UPDATE TRANSACTION
    ================================================ */

    async updateTransaction(id, updates) {
        const userId = await getCurrentUserId();

        const { data: existing, error: fetchError } = await supabase
            .from(TRANSACTIONS_TABLE)
            .select("*")
            .eq("id", id)
            .eq("user_id", userId)
            .single();

        throwIfError(fetchError);

        const investmentId = existing.investment_id;

        const updatedTransaction = {
            ...existing,
            ...updates,
        };

        validateTransaction(updatedTransaction);

        const existingTransactions =
            await getInvestmentTransactions(investmentId, userId);

        const proposedTransactions = existingTransactions.map(
            (item) =>
                item.id === id
                    ? updatedTransaction
                    : item
        );

        // Prevent an edit that would create a negative balance.
        calculateTransactionBalances(proposedTransactions);

        const updatePayload = {
            transaction_type: updatedTransaction.transaction_type,
            amount: Number(updatedTransaction.amount),
            transaction_date: updatedTransaction.transaction_date,
            notes: updatedTransaction.notes || null,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
            .from(TRANSACTIONS_TABLE)
            .update(updatePayload)
            .eq("id", id)
            .eq("user_id", userId);

        throwIfError(error);

        const transactions = await recalculateTransactionBalances(
            investmentId,
            userId
        );

        const affectedMonths = new Set([
            existing.transaction_date,
            updatedTransaction.transaction_date,
        ].map((date) => normalizeMonth(date)));

        for (const month of affectedMonths) {
            await refreshExistingMonthlySnapshot(
                investmentId,
                userId,
                month
            );
        }

        return transactions.find((item) => item.id === id);
    },

    /* ================================================
       10. DELETE TRANSACTION
    ================================================ */

    async deleteTransaction(id) {
        const userId = await getCurrentUserId();

        const { data: existing, error: fetchError } = await supabase
            .from(TRANSACTIONS_TABLE)
            .select("*")
            .eq("id", id)
            .eq("user_id", userId)
            .single();

        throwIfError(fetchError);

        const investmentId = existing.investment_id;

        const { error } = await supabase
            .from(TRANSACTIONS_TABLE)
            .delete()
            .eq("id", id)
            .eq("user_id", userId);

        throwIfError(error);

        await recalculateTransactionBalances(
            investmentId,
            userId
        );

        await refreshExistingMonthlySnapshot(
            investmentId,
            userId,
            existing.transaction_date
        );

        return id;
    },

    /* ================================================
       11. GET MONTHLY SNAPSHOTS
    ================================================ */

    async getMonthlySnapshots({
        investmentId = null,
        year = null,
    } = {}) {
        const userId = await getCurrentUserId();

        let query = supabase
            .from(SNAPSHOTS_TABLE)
            .select("*")
            .eq("user_id", userId)
            .order("month", { ascending: false });

        if (investmentId) {
            query = query.eq("investment_id", investmentId);
        }

        if (year) {
            query = query
                .gte("month", `${year}-01-01`)
                .lt("month", `${Number(year) + 1}-01-01`);
        }

        const { data, error } = await query;

        throwIfError(error);

        return data || [];
    },

    /* ================================================
       12. SAVE / UPDATE MONTHLY SNAPSHOT
    ================================================ */

    async saveSnapshot(payload) {
        const userId = await getCurrentUserId();

        const investmentId = payload?.investment_id;

        if (!investmentId) {
            throw new Error("Investment is required.");
        }

        const investment = await getInvestmentForUser(
            investmentId,
            userId
        );

        const month = normalizeMonth(payload.month);
        const { start, end } = getMonthRange(month);

        // Fetch all transactions belonging to this month.
        const { data: monthTransactions, error: transactionError } =
            await supabase
                .from(TRANSACTIONS_TABLE)
                .select("*")
                .eq("investment_id", investmentId)
                .eq("user_id", userId)
                .gte("transaction_date", start)
                .lt("transaction_date", end);

        throwIfError(transactionError);

        const transactions = monthTransactions || [];

        const contributionTotal = transactions
            .filter(
                (item) =>
                    item.transaction_type === "CONTRIBUTION"
            )
            .reduce(
                (total, item) => total + Number(item.amount),
                0
            );

        const withdrawalTotal = transactions
            .filter(
                (item) =>
                    item.transaction_type === "WITHDRAWAL"
            )
            .reduce(
                (total, item) => total + Number(item.amount),
                0
            );

        // Use the previous month's closing balance.
        const { data: previousSnapshot, error: previousError } =
            await supabase
                .from(SNAPSHOTS_TABLE)
                .select("closing_balance")
                .eq("investment_id", investmentId)
                .eq("user_id", userId)
                .lt("month", month)
                .order("month", { ascending: false })
                .limit(1)
                .maybeSingle();

        throwIfError(previousError);

        const openingBalance =
            payload.opening_balance !== undefined &&
                payload.opening_balance !== null
                ? Number(payload.opening_balance)
                : Number(previousSnapshot?.closing_balance || 0);

        if (!Number.isFinite(openingBalance) || openingBalance < 0) {
            throw new Error("Opening balance cannot be negative.");
        }

        const closingBalance =
            openingBalance +
            contributionTotal -
            withdrawalTotal;

        if (closingBalance < -0.001) {
            throw new Error(
                "Withdrawals cannot exceed the available balance."
            );
        }

        const snapshotPayload = {
            investment_id: investmentId,
            user_id: userId,
            month,
            opening_balance: Number(openingBalance.toFixed(2)),
            contribution_total: Number(
                contributionTotal.toFixed(2)
            ),
            withdrawal_total: Number(
                withdrawalTotal.toFixed(2)
            ),
            closing_balance: Number(
                Math.max(0, closingBalance).toFixed(2)
            ),
            current_market_value:
                payload.current_market_value === "" ||
                    payload.current_market_value == null
                    ? null
                    : Number(payload.current_market_value),
            notes: payload.notes || null,
            updated_at: new Date().toISOString(),
        };

        if (
            snapshotPayload.current_market_value !== null &&
            (
                !Number.isFinite(
                    snapshotPayload.current_market_value
                ) ||
                snapshotPayload.current_market_value < 0
            )
        ) {
            throw new Error(
                "Market value must be a valid non-negative amount."
            );
        }

        // For market-linked investments, market value is separate
        // from the contribution/withdrawal ledger.
        const { data, error } = await supabase
            .from(SNAPSHOTS_TABLE)
            .upsert(snapshotPayload, {
                onConflict: "investment_id,month",
            })
            .select()
            .single();

        throwIfError(error);

        return {
            snapshot: data,
            investment,
        };
    },

    /* ================================================
       13. GET INVESTMENT SUMMARY
    ================================================ */

    async getSummary({
        year = null,
        month = null,
        investmentId = null,
    } = {}) {
        const userId = await getCurrentUserId();

        // Only active investments are included in overall totals.
        let activeInvestmentsQuery = supabase
            .from(INVESTMENTS_TABLE)
            .select("id")
            .eq("user_id", userId)
            .eq("status", "active");

        if (investmentId) {
            activeInvestmentsQuery = activeInvestmentsQuery.eq(
                "id",
                investmentId
            );
        }

        const {
            data: activeInvestments,
            error: investmentsError,
        } = await activeInvestmentsQuery;

        throwIfError(investmentsError);

        const activeInvestmentIds = (activeInvestments || []).map(
            (item) => item.id
        );

        if (activeInvestmentIds.length === 0) {
            return {
                totalContributions: 0,
                totalWithdrawals: 0,
                netInvested: 0,
                transactionCount: 0,
            };
        }

        let transactionQuery = supabase
            .from(TRANSACTIONS_TABLE)
            .select("*")
            .eq("user_id", userId)
            .in("investment_id", activeInvestmentIds);

        if (year) {
            transactionQuery = transactionQuery
                .gte("transaction_date", `${year}-01-01`)
                .lt(
                    "transaction_date",
                    `${Number(year) + 1}-01-01`
                );
        }

        if (month) {
            const { start, end } = getMonthRange(month);

            transactionQuery = transactionQuery
                .gte("transaction_date", start)
                .lt("transaction_date", end);
        }

        const {
            data: transactions,
            error: transactionError,
        } = await transactionQuery;

        throwIfError(transactionError);

        const rows = transactions || [];

        const totalContributions = rows
            .filter(
                (item) => item.transaction_type === "CONTRIBUTION"
            )
            .reduce(
                (total, item) => total + Number(item.amount || 0),
                0
            );

        const totalWithdrawals = rows
            .filter(
                (item) => item.transaction_type === "WITHDRAWAL"
            )
            .reduce(
                (total, item) => total + Number(item.amount || 0),
                0
            );

        return {
            totalContributions: Number(totalContributions.toFixed(2)),
            totalWithdrawals: Number(totalWithdrawals.toFixed(2)),
            netInvested: Number(
                (totalContributions - totalWithdrawals).toFixed(2)
            ),
            transactionCount: rows.length,
        };
    },
};

export default investmentService;
