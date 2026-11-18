
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { healthService } from "../services/healthService";

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
    journeys: [],
    transactions: [],

    loading: false,
    saving: false,

    error: null,
};

// ============================================
// FETCH ALL WEIGHTLOSS DATA
// ============================================

export const fetchWeightlossData = createAsyncThunk(
    "health/fetchWeightlossData",
    async (_, { rejectWithValue }) => {
        try {
            const [journeys, transactions] = await Promise.all([
                healthService.fetchJourneys(),
                healthService.fetchWeightTransactions(),
            ]);

            return {
                journeys,
                transactions,
            };
        } catch (error) {
            return rejectWithValue(
                error?.message || "Unable to fetch weightloss data."
            );
        }
    }
);

// ============================================
// CREATE JOURNEY
// ============================================

export const createJourney = createAsyncThunk(
    "health/createJourney",
    async (payload, { rejectWithValue }) => {
        try {
            return await healthService.createJourney(payload);
        } catch (error) {
            return rejectWithValue(
                error?.message || "Unable to create journey."
            );
        }
    }
);

// ============================================
// UPDATE JOURNEY
// ============================================

export const updateJourney = createAsyncThunk(
    "health/updateJourney",
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            return await healthService.updateJourney(id, payload);
        } catch (error) {
            return rejectWithValue(
                error?.message || "Unable to update journey."
            );
        }
    }
);

// ============================================
// DELETE JOURNEY
// ============================================

export const deleteJourney = createAsyncThunk(
    "health/deleteJourney",
    async (id, { rejectWithValue }) => {
        try {
            return await healthService.deleteJourney(id);
        } catch (error) {
            return rejectWithValue(
                error?.message || "Unable to delete journey."
            );
        }
    }
);

// ============================================
// SAVE DAILY WEIGHT TRANSACTION
// ============================================

export const saveWeightTransaction = createAsyncThunk(
    "health/saveWeightTransaction",
    async (payload, { rejectWithValue }) => {
        try {
            return await healthService.saveWeightTransaction(payload);
        } catch (error) {
            return rejectWithValue(
                error?.message || "Unable to save weight update."
            );
        }
    }
);

// ============================================
// DELETE DAILY WEIGHT TRANSACTION
// ============================================

export const deleteWeightTransaction = createAsyncThunk(
    "health/deleteWeightTransaction",
    async (id, { rejectWithValue }) => {
        try {
            return await healthService.deleteWeightTransaction(id);
        } catch (error) {
            return rejectWithValue(
                error?.message || "Unable to delete weight update."
            );
        }
    }
);

// ============================================
// SLICE
// ============================================

const healthSlice = createSlice({
    name: "health",
    initialState,

    reducers: {
        clearHealthError: (state) => {
            state.error = null;
        },

        clearHealthData: () => initialState,
    },

    extraReducers: (builder) => {
        builder

            // --------------------------------
            // FETCH DATA
            // --------------------------------

            .addCase(fetchWeightlossData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchWeightlossData.fulfilled, (state, action) => {
                state.loading = false;
                state.journeys = action.payload.journeys;
                state.transactions = action.payload.transactions;
            })

            .addCase(fetchWeightlossData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --------------------------------
            // CREATE JOURNEY
            // --------------------------------

            .addCase(createJourney.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(createJourney.fulfilled, (state, action) => {
                state.saving = false;
                state.journeys.unshift(action.payload);
            })

            .addCase(createJourney.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            })

            // --------------------------------
            // UPDATE JOURNEY
            // --------------------------------

            .addCase(updateJourney.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(updateJourney.fulfilled, (state, action) => {
                state.saving = false;

                const index = state.journeys.findIndex(
                    (item) => item.id === action.payload.id
                );

                if (index !== -1) {
                    state.journeys[index] = action.payload;
                }
            })

            .addCase(updateJourney.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            })

            // --------------------------------
            // DELETE JOURNEY
            // --------------------------------

            .addCase(deleteJourney.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(deleteJourney.fulfilled, (state, action) => {
                state.saving = false;

                state.journeys = state.journeys.filter(
                    (item) => item.id !== action.payload
                );

                state.transactions = state.transactions.filter(
                    (item) => item.journey_id !== action.payload
                );
            })

            .addCase(deleteJourney.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            })

            // --------------------------------
            // SAVE WEIGHT TRANSACTION
            // --------------------------------

            .addCase(saveWeightTransaction.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(saveWeightTransaction.fulfilled, (state, action) => {
                state.saving = false;

                const { transaction, journey } = action.payload;

                // Update transaction if date already exists.
                const index = state.transactions.findIndex(
                    (item) =>
                        item.journey_id === transaction.journey_id &&
                        item.update_date === transaction.update_date
                );

                if (index !== -1) {
                    state.transactions[index] = transaction;
                } else {
                    state.transactions.unshift(transaction);
                }

                // Update parent journey's latest weight.
                const journeyIndex = state.journeys.findIndex(
                    (item) => item.id === journey.id
                );

                if (journeyIndex !== -1) {
                    state.journeys[journeyIndex] = journey;
                }
            })

            .addCase(saveWeightTransaction.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            })

            // --------------------------------
            // DELETE WEIGHT TRANSACTION
            // --------------------------------

            .addCase(deleteWeightTransaction.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(deleteWeightTransaction.fulfilled, (state, action) => {
                state.saving = false;

                const { id, journey } = action.payload;

                state.transactions = state.transactions.filter(
                    (item) => item.id !== id
                );

                const journeyIndex = state.journeys.findIndex(
                    (item) => item.id === journey.id
                );

                if (journeyIndex !== -1) {
                    state.journeys[journeyIndex] = journey;
                }
            })

            .addCase(deleteWeightTransaction.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            });
    },
});

// ============================================
// EXPORTS
// ============================================

export const {
    clearHealthError,
    clearHealthData,
} = healthSlice.actions;

export default healthSlice.reducer;
