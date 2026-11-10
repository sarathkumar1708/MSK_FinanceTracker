
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { debtService } from "./services/debtService";

// =========================================
// FETCH ALL DEBT DATA
// =========================================

export const fetchDebtData = createAsyncThunk(
    "debt/fetchDebtData",
    async (_, { rejectWithValue }) => {
        try {
            // Fetch all three resources independently
            const results = await Promise.allSettled([
                debtService.getAll(),
                debtService.getSnapshots(),
                debtService.getPayments(),
            ]);

            const [debtsResult, snapshotsResult, paymentsResult] = results;

            // Debts are essential. If this request fails, reject the fetch.
            if (debtsResult.status === "rejected") {
                throw debtsResult.reason;
            }

            return {
                debts: debtsResult.value ?? [],

                monthlySnapshots:
                    snapshotsResult.status === "fulfilled"
                        ? snapshotsResult.value ?? []
                        : [],

                payments:
                    paymentsResult.status === "fulfilled"
                        ? paymentsResult.value ?? []
                        : [],

                warnings: [
                    snapshotsResult.status === "rejected"
                        ? `Monthly snapshots: ${snapshotsResult.reason?.message}`
                        : null,
                    paymentsResult.status === "rejected"
                        ? `Payments: ${paymentsResult.reason?.message}`
                        : null,
                ].filter(Boolean),
            };
        } catch (error) {
            return rejectWithValue(
                error?.message || "Failed to fetch debt data"
            );
        }
    }
);


// =========================================
// DEBT CRUD
// =========================================

export const createDebt = createAsyncThunk(
    "debt/createDebt",
    async (debt, { rejectWithValue }) => {
        try {
            return await debtService.create(debt);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateDebt = createAsyncThunk(
    "debt/updateDebt",
    async ({ id, updates }, { rejectWithValue }) => {
        try {
            return await debtService.update(id, updates);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteDebt = createAsyncThunk(
    "debt/deleteDebt",
    async (id, { rejectWithValue }) => {
        try {
            return await debtService.delete(id);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


export const closeDebt = createAsyncThunk(
    "debt/closeDebt",
    async (id, { rejectWithValue }) => {
        try {
            await debtService.close(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


// =========================================
// MONTHLY SNAPSHOTS
// =========================================

export const saveMonthlySnapshot = createAsyncThunk(
    "debt/saveMonthlySnapshot",
    async (snapshot, { rejectWithValue }) => {
        try {
            // debtService returns both the saved snapshot
            // and the updated debt with recalculated tenure.
            const result = await debtService.saveSnapshot(snapshot);

            return result;
        } catch (error) {
            console.error("Save monthly snapshot failed:", error);

            return rejectWithValue(
                error?.message || "Failed to save monthly snapshot"
            );
        }
    }
);


// =========================================
// PAYMENT CRUD
// =========================================

export const createPayment = createAsyncThunk(
    "debt/createPayment",
    async (payment, { rejectWithValue }) => {
        try {
            return await debtService.createPayment(payment);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updatePayment = createAsyncThunk(
    "debt/updatePayment",
    async ({ id, updates }, { rejectWithValue }) => {
        try {
            return await debtService.updatePayment(id, updates);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deletePayment = createAsyncThunk(
    "debt/deletePayment",
    async (id, { rejectWithValue }) => {
        try {
            return await debtService.deletePayment(id);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// =========================================
// FETCH ACTIVITY LOGS
// =========================================

export const fetchActivityLogs = createAsyncThunk(
    "debt/fetchActivityLogs",
    async (filters = {}, { rejectWithValue }) => {
        try {
            return await debtService.getActivityLogs(filters);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


// =========================================
// INITIAL STATE
// =========================================

const initialState = {
    debts: [],
    monthlySnapshots: [],
    payments: [],
    activityLogs: [],

    loading: false,
    activityLoading: false,
    saving: false,
    error: null,
};


// =========================================
// SLICE
// =========================================

const debtSlice = createSlice({
    name: "debt",
    initialState,

    reducers: {
        clearDebtData: (state) => {
            state.debts = [];
            state.monthlySnapshots = [];
            state.payments = [];
            state.activityLogs = [];

            state.loading = false;
            state.saving = false;
            state.activityLoading = false;
            state.error = null;
        },

        clearDebtError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder

            // ---------------------------------
            // FETCH ALL DEBT DATA
            // ---------------------------------

            .addCase(fetchDebtData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchDebtData.fulfilled, (state, action) => {
                state.loading = false;

                state.debts = action.payload.debts;
                state.monthlySnapshots = action.payload.monthlySnapshots;
                state.payments = action.payload.payments;

                state.error = action.payload.warnings.length
                    ? action.payload.warnings.join(" | ")
                    : null;
            })

            .addCase(fetchDebtData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch debt data";
            })


            // ---------------------------------
            // CREATE DEBT
            // ---------------------------------

            .addCase(createDebt.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(createDebt.fulfilled, (state, action) => {
                state.loading = false;
                state.debts.unshift(action.payload);
            })

            .addCase(createDebt.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


            // ---------------------------------
            // UPDATE DEBT
            // ---------------------------------

            .addCase(updateDebt.fulfilled, (state, action) => {
                state.loading = false;

                const index = state.debts.findIndex(
                    (item) => item.id === action.payload.id
                );

                if (index !== -1) {
                    state.debts[index] = action.payload;
                }
            })

            .addCase(updateDebt.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(updateDebt.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


            // ---------------------------------
            // DELETE DEBT
            // ---------------------------------

            .addCase(deleteDebt.fulfilled, (state, action) => {
                state.loading = false;

                const deletedDebtId = action.payload;

                // Remove debt
                state.debts = state.debts.filter(
                    (item) => item.id !== deletedDebtId
                );

                // Remove related monthly snapshots
                state.monthlySnapshots = state.monthlySnapshots.filter(
                    (item) => item.debt_id !== deletedDebtId
                );

                // Remove related payments
                state.payments = state.payments.filter(
                    (item) => item.debt_id !== deletedDebtId
                );
            })

            .addCase(deleteDebt.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(deleteDebt.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(closeDebt.fulfilled, (state, action) => {
                const debt = state.debts.find(
                    (item) => item.id === action.payload
                );

                if (debt) {
                    debt.status = "closed";
                }
            })


            // ---------------------------------
            // SAVE MONTHLY SNAPSHOT
            // ---------------------------------

            .addCase(saveMonthlySnapshot.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(saveMonthlySnapshot.fulfilled, (state, action) => {
                state.loading = false;

                const { snapshot, debt } = action.payload;

                // Update or insert monthly snapshot.
                const snapshotIndex = state.monthlySnapshots.findIndex(
                    (item) =>
                        item.debt_id === snapshot.debt_id &&
                        item.month === snapshot.month
                );

                if (snapshotIndex !== -1) {
                    state.monthlySnapshots[snapshotIndex] = snapshot;
                } else {
                    state.monthlySnapshots.unshift(snapshot);
                }

                // Update debt information, including remaining tenure and EMI.
                if (debt) {
                    const debtIndex = state.debts.findIndex(
                        (item) => item.id === debt.id
                    );

                    if (debtIndex !== -1) {
                        state.debts[debtIndex] = debt;
                    }
                }
            })

            .addCase(saveMonthlySnapshot.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


            // ---------------------------------
            // CREATE PAYMENT
            // ---------------------------------

            .addCase(createPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(createPayment.fulfilled, (state, action) => {
                state.loading = false;
                state.payments.unshift(action.payload);
            })

            .addCase(createPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


            // ---------------------------------
            // UPDATE PAYMENT
            // ---------------------------------

            .addCase(updatePayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(updatePayment.fulfilled, (state, action) => {
                state.loading = false;

                const index = state.payments.findIndex(
                    (item) => item.id === action.payload.id
                );

                if (index !== -1) {
                    state.payments[index] = action.payload;
                }
            })

            .addCase(updatePayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


            // ---------------------------------
            // DELETE PAYMENT
            // ---------------------------------

            .addCase(deletePayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(deletePayment.fulfilled, (state, action) => {
                state.loading = false;

                state.payments = state.payments.filter(
                    (item) => item.id !== action.payload
                );
            })

            // =========================================
            // ACTIVITY LOGS
            // =========================================

            .addCase(fetchActivityLogs.pending, (state) => {
                state.activityLoading = true;
                state.error = null;
            })

            .addCase(fetchActivityLogs.fulfilled, (state, action) => {
                state.activityLoading = false;
                state.activityLogs = action.payload;
            })

            .addCase(fetchActivityLogs.rejected, (state, action) => {
                state.activityLoading = false;
                state.error = action.payload || "Failed to fetch activity logs";
            })

            .addCase(deletePayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearDebtData,
    clearDebtError,
} = debtSlice.actions;

export default debtSlice.reducer;
