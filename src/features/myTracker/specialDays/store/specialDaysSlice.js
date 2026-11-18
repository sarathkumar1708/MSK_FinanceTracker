
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { specialDaysService } from "../services/specialDaysService";


// ============================================
// ASYNC THUNKS
// ============================================

// Fetch all special days
export const fetchSpecialDays = createAsyncThunk(
    "specialDays/fetchSpecialDays",
    async (_, { rejectWithValue }) => {
        try {
            return await specialDaysService.getSpecialDays();
        } catch (error) {
            return rejectWithValue(
                error.message || "Unable to fetch special days."
            );
        }
    }
);

// Create special day
export const createSpecialDay = createAsyncThunk(
    "specialDays/createSpecialDay",
    async (specialDayData, { rejectWithValue }) => {
        try {
            return await specialDaysService.createSpecialDay(specialDayData);
        } catch (error) {
            return rejectWithValue(
                error.message || "Unable to create special day."
            );
        }
    }
);

// Update special day
export const updateSpecialDay = createAsyncThunk(
    "specialDays/updateSpecialDay",
    async (specialDayData, { rejectWithValue }) => {
        try {
            return await specialDaysService.updateSpecialDay(specialDayData);
        } catch (error) {
            return rejectWithValue(
                error.message || "Unable to update special day."
            );
        }
    }
);

// Delete special day
export const deleteSpecialDay = createAsyncThunk(
    "specialDays/deleteSpecialDay",
    async (id, { rejectWithValue }) => {
        try {
            return await specialDaysService.deleteSpecialDay(id);
        } catch (error) {
            return rejectWithValue(
                error.message || "Unable to delete special day."
            );
        }
    }
);

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
    specialDays: [],
    loading: false,
    saving: false,
    error: null,
};

// ============================================
// SLICE
// ============================================

const specialDaysSlice = createSlice({
    name: "specialDays",
    initialState,
    reducers: {
        clearSpecialDaysError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder

            // FETCH
            .addCase(fetchSpecialDays.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSpecialDays.fulfilled, (state, action) => {
                state.loading = false;
                state.specialDays = action.payload || [];
                state.error = null;
            })
            .addCase(fetchSpecialDays.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload ?? action.error.message;
            })

            // CREATE
            .addCase(createSpecialDay.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createSpecialDay.fulfilled, (state, action) => {
                state.saving = false;

                state.specialDays.push(action.payload);

                state.specialDays.sort((a, b) =>
                    a.event_date.localeCompare(b.event_date)
                );

                state.error = null;
            })
            .addCase(createSpecialDay.rejected, (state, action) => {
                state.saving = false;
                state.error =
                    action.payload ?? action.error.message;
            })

            // UPDATE
            .addCase(updateSpecialDay.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateSpecialDay.fulfilled, (state, action) => {
                state.saving = false;

                const index = state.specialDays.findIndex(
                    (item) => item.id === action.payload.id
                );

                if (index !== -1) {
                    state.specialDays[index] = action.payload;
                }

                state.specialDays.sort((a, b) =>
                    a.event_date.localeCompare(b.event_date)
                );

                state.error = null;
            })
            .addCase(updateSpecialDay.rejected, (state, action) => {
                state.saving = false;
                state.error =
                    action.payload ?? action.error.message;
            })

            // DELETE
            .addCase(deleteSpecialDay.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(deleteSpecialDay.fulfilled, (state, action) => {
                state.saving = false;

                state.specialDays = state.specialDays.filter(
                    (item) => item.id !== action.payload
                );

                state.error = null;
            })
            .addCase(deleteSpecialDay.rejected, (state, action) => {
                state.saving = false;
                state.error =
                    action.payload ?? action.error.message;
            });
    },
});

export const { clearSpecialDaysError } = specialDaysSlice.actions;

export default specialDaysSlice.reducer;
