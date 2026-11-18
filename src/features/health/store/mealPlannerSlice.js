
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { mealPlannerService } from "../services/mealPlannerService";

// =====================================================
// ASYNC THUNKS - JOURNEYS
// =====================================================

export const fetchMealJourneys = createAsyncThunk(
    "mealPlanner/fetchJourneys",
    async (_, { rejectWithValue }) => {
        try {
            return await mealPlannerService.fetchJourneys();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createMealJourney = createAsyncThunk(
    "mealPlanner/createJourney",
    async (payload, { rejectWithValue }) => {
        try {
            return await mealPlannerService.createJourney(payload);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateMealJourney = createAsyncThunk(
    "mealPlanner/updateJourney",
    async (payload, { rejectWithValue }) => {
        try {
            return await mealPlannerService.updateJourney(payload);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteMealJourney = createAsyncThunk(
    "mealPlanner/deleteJourney",
    async (id, { rejectWithValue }) => {
        try {
            return await mealPlannerService.deleteJourney(id);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// =====================================================
// ASYNC THUNKS - MEAL PLANS
// =====================================================

export const fetchMealPlans = createAsyncThunk(
    "mealPlanner/fetchMealPlans",
    async (filters, { rejectWithValue }) => {
        try {
            return await mealPlannerService.fetchMealPlans(filters);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createMealPlan = createAsyncThunk(
    "mealPlanner/createMealPlan",
    async (payload, { rejectWithValue }) => {
        try {
            return await mealPlannerService.createMealPlan(payload);
        } catch (error) {
            return rejectWithValue(
                getThunkErrorMessage(error, "Unable to create meal.")
            );
        }
    }
);

export const updateMealPlan = createAsyncThunk(
    "mealPlanner/updateMealPlan",
    async (payload, { rejectWithValue }) => {
        try {
            return await mealPlannerService.updateMealPlan(payload);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteMealPlan = createAsyncThunk(
    "mealPlanner/deleteMealPlan",
    async (id, { rejectWithValue }) => {
        try {
            return await mealPlannerService.deleteMealPlan(id);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// =====================================================
// ASYNC THUNKS - FOOD ITEMS
// =====================================================

export const createFoodItem = createAsyncThunk(
    "mealPlanner/createFoodItem",
    async (payload, { rejectWithValue }) => {
        try {
            return await mealPlannerService.createFoodItem(payload);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateFoodItem = createAsyncThunk(
    "mealPlanner/updateFoodItem",
    async (payload, { rejectWithValue }) => {
        try {
            return await mealPlannerService.updateFoodItem(payload);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteFoodItem = createAsyncThunk(
    "mealPlanner/deleteFoodItem",
    async (id, { rejectWithValue }) => {
        try {
            return await mealPlannerService.deleteFoodItem(id);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
    journeys: [],
    mealPlans: [],

    loading: false,
    saving: false,

    error: null,
};

// =====================================================
// HELPER - UPDATE FOOD ITEM INSIDE A MEAL
// =====================================================

function updateFoodItemInMeals(state, item) {
    const meal = state.mealPlans.find(
        (meal) => meal.id === item.meal_plan_id
    );

    if (!meal) return;

    if (!meal.food_items) {
        meal.food_items = [];
    }

    const index = meal.food_items.findIndex(
        (food) => food.id === item.id
    );

    if (index >= 0) {
        meal.food_items[index] = item;
    } else {
        meal.food_items.push(item);
    }
}

function getThunkErrorMessage(error, fallbackMessage) {
    if (typeof error === "string" && error.trim()) {
        return error;
    }

    return (
        error?.message ||
        error?.details ||
        error?.hint ||
        fallbackMessage
    );
}

// =====================================================
// SLICE
// =====================================================

const mealPlannerSlice = createSlice({
    name: "mealPlanner",

    initialState,

    reducers: {
        clearMealPlannerError(state) {
            state.error = null;
        },

        clearMealPlans(state) {
            state.mealPlans = [];
        },

        resetMealPlannerState() {
            return initialState;
        },
    },

    extraReducers: (builder) => {

        // =============================================
        // FETCH JOURNEYS
        // =============================================

        builder
            .addCase(fetchMealJourneys.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMealJourneys.fulfilled, (state, action) => {
                state.loading = false;
                state.journeys = action.payload;
            })
            .addCase(fetchMealJourneys.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // =============================================
        // CREATE JOURNEY
        // =============================================

        builder
            .addCase(createMealJourney.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createMealJourney.fulfilled, (state, action) => {
                state.saving = false;
                state.journeys.unshift(action.payload);
            })
            .addCase(createMealJourney.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            });

        // =============================================
        // UPDATE JOURNEY
        // =============================================

        builder
            .addCase(updateMealJourney.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateMealJourney.fulfilled, (state, action) => {
                state.saving = false;

                const index = state.journeys.findIndex(
                    (item) => item.id === action.payload.id
                );

                if (index >= 0) {
                    state.journeys[index] = action.payload;
                }
            })
            .addCase(updateMealJourney.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            });

        // =============================================
        // DELETE JOURNEY
        // =============================================

        builder
            .addCase(deleteMealJourney.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(deleteMealJourney.fulfilled, (state, action) => {
                state.saving = false;

                state.journeys = state.journeys.filter(
                    (item) => item.id !== action.payload
                );

                state.mealPlans = state.mealPlans.filter(
                    (item) => item.journey_id !== action.payload
                );
            })
            .addCase(deleteMealJourney.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            });

        // =============================================
        // FETCH MEAL PLANS
        // =============================================

        builder
            .addCase(fetchMealPlans.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMealPlans.fulfilled, (state, action) => {
                state.loading = false;
                state.mealPlans = action.payload;
            })
            .addCase(fetchMealPlans.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // =============================================
        // CREATE MEAL PLAN
        // =============================================

        builder
            .addCase(createMealPlan.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createMealPlan.fulfilled, (state, action) => {
                state.saving = false;
                state.mealPlans.push(action.payload);
            })
            .addCase(createMealPlan.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            });

        // =============================================
        // UPDATE MEAL PLAN
        // =============================================

        builder
            .addCase(updateMealPlan.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateMealPlan.fulfilled, (state, action) => {
                state.saving = false;

                const index = state.mealPlans.findIndex(
                    (item) => item.id === action.payload.id
                );

                if (index >= 0) {
                    state.mealPlans[index] = {
                        ...state.mealPlans[index],
                        ...action.payload,
                    };
                }
            })
            .addCase(updateMealPlan.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            });

        // =============================================
        // DELETE MEAL PLAN
        // =============================================

        builder
            .addCase(deleteMealPlan.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(deleteMealPlan.fulfilled, (state, action) => {
                state.saving = false;

                state.mealPlans = state.mealPlans.filter(
                    (item) => item.id !== action.payload
                );
            })
            .addCase(deleteMealPlan.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            });

        // =============================================
        // CREATE FOOD ITEM
        // =============================================

        builder
            .addCase(createFoodItem.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createFoodItem.fulfilled, (state, action) => {
                state.saving = false;
                updateFoodItemInMeals(state, action.payload);
            })
            .addCase(createFoodItem.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            });

        // =============================================
        // UPDATE FOOD ITEM
        // =============================================

        builder
            .addCase(updateFoodItem.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateFoodItem.fulfilled, (state, action) => {
                state.saving = false;
                updateFoodItemInMeals(state, action.payload);
            })
            .addCase(updateFoodItem.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            });

        // =============================================
        // DELETE FOOD ITEM
        // =============================================

        builder
            .addCase(deleteFoodItem.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(deleteFoodItem.fulfilled, (state, action) => {
                state.saving = false;

                state.mealPlans.forEach((meal) => {
                    meal.food_items = (meal.food_items || []).filter(
                        (item) => item.id !== action.payload
                    );
                });
            })
            .addCase(deleteFoodItem.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            });
    },
});

// =====================================================
// EXPORTS
// =====================================================

export const {
    clearMealPlannerError,
    clearMealPlans,
    resetMealPlannerState,
} = mealPlannerSlice.actions;

export default mealPlannerSlice.reducer;
