
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import investmentService from "./services/investmentService";

/* =====================================================
   INITIAL STATE
===================================================== */

const initialState = {
    investments: [],
    transactions: [],
    monthlySnapshots: [],

    summary: {
        totalContributions: 0,
        totalWithdrawals: 0,
        netInvested: 0,
        transactionCount: 0,
    },

    loading: false,
    saving: false,
    transactionSaving: false,
    snapshotSaving: false,

    error: null,
};

/* =====================================================
   COMMON ERROR HANDLER
===================================================== */

const getErrorMessage = (error, fallback) => {
    return error?.message || fallback;
};

/* =====================================================
   REFRESH TRANSACTION-RELATED DATA
===================================================== */

const refreshTransactionData = async (investmentId) => {
    const [
        transactions,
        monthlySnapshots,
        summary,
    ] = await Promise.all([
        investmentService.getTransactions(),
        investmentService.getMonthlySnapshots(),
        investmentService.getSummary(),
    ]);

    return {
        investmentId,
        transactions,
        monthlySnapshots,
        summary,
    };
};

/* =====================================================
   1. FETCH INVESTMENT DATA
===================================================== */

export const fetchInvestmentData = createAsyncThunk(
    "investments/fetchInvestmentData",
    async (_, { rejectWithValue }) => {
        try {
            const [
                investments,
                transactions,
                monthlySnapshots,
                summary,
            ] = await Promise.all([
                investmentService.getAll(),
                investmentService.getTransactions(),
                investmentService.getMonthlySnapshots(),
                investmentService.getSummary(),
            ]);

            return {
                investments,
                transactions,
                monthlySnapshots,
                summary,
            };
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(
                    error,
                    "Failed to fetch investment data"
                )
            );
        }
    }
);

/* =====================================================
   2. CREATE INVESTMENT
===================================================== */

export const createInvestment = createAsyncThunk(
    "investments/createInvestment",
    async (payload, { rejectWithValue }) => {
        try {
            return await investmentService.create(payload);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(
                    error,
                    "Failed to create investment"
                )
            );
        }
    }
);

/* =====================================================
   3. UPDATE INVESTMENT
===================================================== */

export const updateInvestment = createAsyncThunk(
    "investments/updateInvestment",
    async ({ id, updates }, { rejectWithValue }) => {
        try {
            return await investmentService.update(id, updates);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(
                    error,
                    "Failed to update investment"
                )
            );
        }
    }
);

/* =====================================================
   4. DELETE INVESTMENT
===================================================== */

export const deleteInvestment = createAsyncThunk(
    "investments/deleteInvestment",
    async (id, { rejectWithValue }) => {
        try {
            await investmentService.delete(id);
            return id;
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(
                    error,
                    "Failed to delete investment"
                )
            );
        }
    }
);

/* =====================================================
   5. CLOSE INVESTMENT
===================================================== */

export const closeInvestment = createAsyncThunk(
    "investments/closeInvestment",
    async (id, { rejectWithValue }) => {
        try {
            return await investmentService.close(id);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(
                    error,
                    "Failed to close investment"
                )
            );
        }
    }
);

/* =====================================================
   6. CREATE CONTRIBUTION / WITHDRAWAL
===================================================== */

export const createInvestmentTransaction = createAsyncThunk(
    "investments/createInvestmentTransaction",
    async (payload, { rejectWithValue }) => {
        try {
            const transaction =
                await investmentService.createTransaction(payload);

            const refreshedData = await refreshTransactionData(
                payload.investment_id
            );

            return {
                transaction,
                ...refreshedData,
            };
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(
                    error,
                    "Failed to save investment transaction"
                )
            );
        }
    }
);

/* =====================================================
   7. UPDATE CONTRIBUTION / WITHDRAWAL
===================================================== */

export const updateInvestmentTransaction = createAsyncThunk(
    "investments/updateInvestmentTransaction",
    async ({ id, updates }, { rejectWithValue }) => {
        try {
            const transaction =
                await investmentService.updateTransaction(
                    id,
                    updates
                );

            const refreshedData = await refreshTransactionData(
                transaction.investment_id
            );

            return {
                transaction,
                ...refreshedData,
            };
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(
                    error,
                    "Failed to update investment transaction"
                )
            );
        }
    }
);

/* =====================================================
   8. DELETE CONTRIBUTION / WITHDRAWAL
===================================================== */

export const deleteInvestmentTransaction = createAsyncThunk(
    "investments/deleteInvestmentTransaction",
    async (id, { getState, rejectWithValue }) => {
        try {
            const transaction = getState().investment.transactions.find(
                (item) => item.id === id
            );

            if (!transaction) {
                throw new Error(
                    "Investment transaction was not found."
                );
            }

            await investmentService.deleteTransaction(id);

            const refreshedData = await refreshTransactionData(
                transaction.investment_id
            );

            return {
                id,
                ...refreshedData,
            };
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(
                    error,
                    "Failed to delete investment transaction"
                )
            );
        }
    }
);

/* =====================================================
   9. SAVE MONTHLY SNAPSHOT
===================================================== */

export const saveInvestmentSnapshot = createAsyncThunk(
    "investments/saveInvestmentSnapshot",
    async (payload, { rejectWithValue }) => {
        try {
            const result =
                await investmentService.saveSnapshot(payload);

            return result;
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(
                    error,
                    "Failed to save monthly investment update"
                )
            );
        }
    }
);

/* =====================================================
   REDUX SLICE
===================================================== */

const investmentSlice = createSlice({
    name: "investment",

    initialState,

    reducers: {
        clearInvestmentError: (state) => {
            state.error = null;
        },

        resetInvestmentState: () => initialState,
    },

    extraReducers: (builder) => {
        builder

            /* =========================================
               FETCH INVESTMENT DATA
            ========================================= */

            .addCase(
                fetchInvestmentData.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                fetchInvestmentData.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.investments =
                        action.payload.investments || [];

                    state.transactions =
                        action.payload.transactions || [];

                    state.monthlySnapshots =
                        action.payload.monthlySnapshots || [];

                    state.summary =
                        action.payload.summary || initialState.summary;
                }
            )

            .addCase(
                fetchInvestmentData.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            )

            /* =========================================
               CREATE INVESTMENT
            ========================================= */

            .addCase(
                createInvestment.pending,
                (state) => {
                    state.saving = true;
                    state.error = null;
                }
            )

            .addCase(
                createInvestment.fulfilled,
                (state, action) => {
                    state.saving = false;

                    state.investments.unshift(action.payload);
                }
            )

            .addCase(
                createInvestment.rejected,
                (state, action) => {
                    state.saving = false;
                    state.error = action.payload;
                }
            )

            /* =========================================
               UPDATE INVESTMENT
            ========================================= */

            .addCase(
                updateInvestment.pending,
                (state) => {
                    state.saving = true;
                    state.error = null;
                }
            )

            .addCase(
                updateInvestment.fulfilled,
                (state, action) => {
                    state.saving = false;

                    const index = state.investments.findIndex(
                        (item) => item.id === action.payload.id
                    );

                    if (index !== -1) {
                        state.investments[index] = action.payload;
                    }
                }
            )

            .addCase(
                updateInvestment.rejected,
                (state, action) => {
                    state.saving = false;
                    state.error = action.payload;
                }
            )

            /* =========================================
               DELETE INVESTMENT
            ========================================= */

            .addCase(
                deleteInvestment.pending,
                (state) => {
                    state.saving = true;
                    state.error = null;
                }
            )

            .addCase(
                deleteInvestment.fulfilled,
                (state, action) => {
                    state.saving = false;

                    state.investments = state.investments.filter(
                        (item) => item.id !== action.payload
                    );
                }
            )

            .addCase(
                deleteInvestment.rejected,
                (state, action) => {
                    state.saving = false;
                    state.error = action.payload;
                }
            )

            /* =========================================
               CLOSE INVESTMENT
            ========================================= */

            .addCase(
                closeInvestment.pending,
                (state) => {
                    state.saving = true;
                    state.error = null;
                }
            )

            .addCase(
                closeInvestment.fulfilled,
                (state, action) => {
                    state.saving = false;

                    const index = state.investments.findIndex(
                        (item) => item.id === action.payload.id
                    );

                    if (index !== -1) {
                        state.investments[index] = action.payload;
                    }
                }
            )

            .addCase(
                closeInvestment.rejected,
                (state, action) => {
                    state.saving = false;
                    state.error = action.payload;
                }
            )

            /* =========================================
               CREATE TRANSACTION
            ========================================= */

            .addCase(
                createInvestmentTransaction.pending,
                (state) => {
                    state.transactionSaving = true;
                    state.error = null;
                }
            )

            .addCase(
                createInvestmentTransaction.fulfilled,
                (state, action) => {
                    state.transactionSaving = false;

                    state.transactions =
                        action.payload.transactions || [];

                    state.monthlySnapshots =
                        action.payload.monthlySnapshots || [];

                    state.summary =
                        action.payload.summary || state.summary;
                }
            )

            .addCase(
                createInvestmentTransaction.rejected,
                (state, action) => {
                    state.transactionSaving = false;
                    state.error = action.payload;
                }
            )

            /* =========================================
               UPDATE TRANSACTION
            ========================================= */

            .addCase(
                updateInvestmentTransaction.pending,
                (state) => {
                    state.transactionSaving = true;
                    state.error = null;
                }
            )

            .addCase(
                updateInvestmentTransaction.fulfilled,
                (state, action) => {
                    state.transactionSaving = false;

                    state.transactions =
                        action.payload.transactions || [];

                    state.monthlySnapshots =
                        action.payload.monthlySnapshots || [];

                    state.summary =
                        action.payload.summary || state.summary;
                }
            )

            .addCase(
                updateInvestmentTransaction.rejected,
                (state, action) => {
                    state.transactionSaving = false;
                    state.error = action.payload;
                }
            )

            /* =========================================
               DELETE TRANSACTION
            ========================================= */

            .addCase(
                deleteInvestmentTransaction.pending,
                (state) => {
                    state.transactionSaving = true;
                    state.error = null;
                }
            )

            .addCase(
                deleteInvestmentTransaction.fulfilled,
                (state, action) => {
                    state.transactionSaving = false;

                    state.transactions =
                        action.payload.transactions || [];

                    state.monthlySnapshots =
                        action.payload.monthlySnapshots || [];

                    state.summary =
                        action.payload.summary || state.summary;
                }
            )

            .addCase(
                deleteInvestmentTransaction.rejected,
                (state, action) => {
                    state.transactionSaving = false;
                    state.error = action.payload;
                }
            )

            /* =========================================
               SAVE MONTHLY SNAPSHOT
            ========================================= */

            .addCase(
                saveInvestmentSnapshot.pending,
                (state) => {
                    state.snapshotSaving = true;
                    state.error = null;
                }
            )

            .addCase(
                saveInvestmentSnapshot.fulfilled,
                (state, action) => {
                    state.snapshotSaving = false;

                    const snapshot = action.payload.snapshot;

                    if (!snapshot) return;

                    const index = state.monthlySnapshots.findIndex(
                        (item) =>
                            item.investment_id ===
                            snapshot.investment_id &&
                            item.month === snapshot.month
                    );

                    if (index !== -1) {
                        state.monthlySnapshots[index] = snapshot;
                    } else {
                        state.monthlySnapshots.unshift(snapshot);
                    }
                }
            )

            .addCase(
                saveInvestmentSnapshot.rejected,
                (state, action) => {
                    state.snapshotSaving = false;
                    state.error = action.payload;
                }
            );
    },
});

/* =====================================================
   EXPORTS
===================================================== */

export const {
    clearInvestmentError,
    resetInvestmentState,
} = investmentSlice.actions;

export default investmentSlice.reducer;
