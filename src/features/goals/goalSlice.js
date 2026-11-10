
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import goalService from "./services/goalService";

// Common error handler
const getErrorMessage = (error) =>
    error?.message || "Something went wrong. Please try again.";

// Fetch goals
export const fetchGoals = createAsyncThunk(
    "goals/fetchGoals",
    async (_, { rejectWithValue }) => {
        try {
            return await goalService.getAll();
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// Create goal
export const createGoal = createAsyncThunk(
    "goals/createGoal",
    async (goalData, { rejectWithValue }) => {
        try {
            return await goalService.create(goalData);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// Update goal
export const updateGoal = createAsyncThunk(
    "goals/updateGoal",
    async ({ id, updates }, { rejectWithValue }) => {
        try {
            return await goalService.update(id, updates);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// Delete goal
export const deleteGoal = createAsyncThunk(
    "goals/deleteGoal",
    async (id, { rejectWithValue }) => {
        try {
            return await goalService.delete(id);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

const initialState = {
    goals: [],
    loading: false,
    saving: false,
    error: null,
};

const goalSlice = createSlice({
    name: "goals",
    initialState,
    reducers: {
        clearGoalError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder

            // Fetch goals
            .addCase(fetchGoals.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGoals.fulfilled, (state, action) => {
                state.loading = false;
                state.goals = action.payload;
            })
            .addCase(fetchGoals.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create goal
            .addCase(createGoal.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createGoal.fulfilled, (state, action) => {
                state.saving = false;
                state.goals.unshift(action.payload);
            })
            .addCase(createGoal.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            })

            // Update goal
            .addCase(updateGoal.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateGoal.fulfilled, (state, action) => {
                state.saving = false;

                const index = state.goals.findIndex(
                    (goal) => goal.id === action.payload.id
                );

                if (index !== -1) {
                    state.goals[index] = action.payload;
                }
            })
            .addCase(updateGoal.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            })

            // Delete goal
            .addCase(deleteGoal.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(deleteGoal.fulfilled, (state, action) => {
                state.saving = false;

                state.goals = state.goals.filter(
                    (goal) => goal.id !== action.payload
                );
            })
            .addCase(deleteGoal.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            });
    },
});

export const { clearGoalError } = goalSlice.actions;

export default goalSlice.reducer;
