
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import budgetService from "./services/budgetService";

/* =====================================================
   HELPERS
===================================================== */

const getErrorMessage = (error) =>
    error?.message || "Something went wrong. Please try again.";

const handleThunkError = (error, rejectWithValue) =>
    rejectWithValue(getErrorMessage(error));

const updateById = (items, updatedItem) =>
    items.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
    );

const removeById = (items, id) =>
    items.filter((item) => item.id !== id);

/* =====================================================
   YEAR & MONTH DATA
===================================================== */

export const fetchBudgetYear = createAsyncThunk(
    "budget/fetchBudgetYear",
    async (year, { rejectWithValue }) => {
        try {
            return {
                year,
                ...(await budgetService.getYearOverview(year)),
            };
        } catch (error) {
            return handleThunkError(error, rejectWithValue);
        }
    }
);

export const fetchBudgetMonth = createAsyncThunk(
    "budget/fetchBudgetMonth",
    async ({ year, month }, { rejectWithValue }) => {
        try {
            return {
                year,
                month,
                ...(await budgetService.getMonthDetails(year, month)),
            };
        } catch (error) {
            return handleThunkError(error, rejectWithValue);
        }
    }
);

/* =====================================================
   CATEGORIES
===================================================== */

export const fetchBudgetCategories = createAsyncThunk(
    "budget/fetchBudgetCategories",
    async (_, { rejectWithValue }) => {
        try {
            return await budgetService.getCategories();
        } catch (error) {
            return handleThunkError(error, rejectWithValue);
        }
    }
);

export const createBudgetCategory = createAsyncThunk(
    "budget/createBudgetCategory",
    async (payload, { rejectWithValue }) => {
        try {
            return await budgetService.createCategory(payload);
        } catch (error) {
            return handleThunkError(error, rejectWithValue);
        }
    }
);

export const updateBudgetCategory = createAsyncThunk(
    "budget/updateBudgetCategory",
    async ({ id, updates }, { rejectWithValue }) => {
        try {
            return await budgetService.updateCategory(id, updates);
        } catch (error) {
            return handleThunkError(error, rejectWithValue);
        }
    }
);

export const deleteBudgetCategory = createAsyncThunk(
    "budget/deleteBudgetCategory",
    async (id, { rejectWithValue }) => {
        try {
            await budgetService.deleteCategory(id);
            return id;
        } catch (error) {
            return handleThunkError(error, rejectWithValue);
        }
    }
);

/* =====================================================
   INCOME
===================================================== */

export const createBudgetIncome = createAsyncThunk(
    "budget/createBudgetIncome",
    async (payload, { rejectWithValue }) => {
        try {
            return await budgetService.createIncome(payload);
        } catch (error) {
            return handleThunkError(error, rejectWithValue);
        }
    }
);

export const updateBudgetIncome = createAsyncThunk(
    "budget/updateBudgetIncome",
    async ({ id, updates }, { rejectWithValue }) => {
        try {
            return await budgetService.updateIncome(id, updates);
        } catch (error) {
            return handleThunkError(error, rejectWithValue);
        }
    }
);

export const deleteBudgetIncome = createAsyncThunk(
    "budget/deleteBudgetIncome",
    async (id, { rejectWithValue }) => {
        try {
            await budgetService.deleteIncome(id);
            return id;
        } catch (error) {
            return handleThunkError(error, rejectWithValue);
        }
    }
);

/* =====================================================
   BUDGET ITEMS
===================================================== */

export const createBudgetItem = createAsyncThunk(
    "budget/createBudgetItem",
    async (payload, { rejectWithValue }) => {
        try {
            return await budgetService.createBudgetItem(payload);
        } catch (error) {
            return handleThunkError(error, rejectWithValue);
        }
    }
);

export const updateBudgetItem = createAsyncThunk(
    "budget/updateBudgetItem",
    async ({ id, updates }, { rejectWithValue }) => {
        try {
            return await budgetService.updateBudgetItem(id, updates);
        } catch (error) {
            return handleThunkError(error, rejectWithValue);
        }
    }
);

export const deleteBudgetItem = createAsyncThunk(
    "budget/deleteBudgetItem",
    async (id, { rejectWithValue }) => {
        try {
            await budgetService.deleteBudgetItem(id);
            return id;
        } catch (error) {
            return handleThunkError(error, rejectWithValue);
        }
    }
);

/* =====================================================
   INITIAL STATE
===================================================== */

const initialState = {
    months: [],
    incomes: [],
    budgetItems: [],
    categories: [],

    selectedMonth: null,
    selectedYear: new Date().getFullYear(),

    loading: false,
    monthLoading: false,
    categoriesLoading: false,
    saving: false,

    error: null,
};

/* =====================================================
   SLICE
===================================================== */

const budgetSlice = createSlice({
    name: "budget",
    initialState,

    reducers: {
        clearBudgetError: (state) => {
            state.error = null;
        },

        clearSelectedBudgetMonth: (state) => {
            state.selectedMonth = null;
            state.incomes = [];
            state.budgetItems = [];
        },

        setSelectedBudgetYear: (state, action) => {
            state.selectedYear = action.payload;
        },
    },

    extraReducers: (builder) => {
        builder

            /* -----------------------------------------
               FETCH YEAR
            ----------------------------------------- */

            .addCase(fetchBudgetYear.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchBudgetYear.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedYear = action.payload.year;
                state.months = action.payload.months || [];
                state.incomes = action.payload.incomes || [];
                state.budgetItems = action.payload.budgetItems || [];
            })

            .addCase(fetchBudgetYear.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })

            /* -----------------------------------------
               FETCH MONTH
            ----------------------------------------- */

            .addCase(fetchBudgetMonth.pending, (state) => {
                state.monthLoading = true;
                state.error = null;
            })

            .addCase(fetchBudgetMonth.fulfilled, (state, action) => {
                state.monthLoading = false;

                const { month: monthData, year, month } = action.payload;

                state.selectedYear = year;
                state.selectedMonth = monthData || null;
                state.incomes = action.payload.incomes || [];
                state.budgetItems = action.payload.budgetItems || [];

                // Add the month to the year overview if it is new.
                if (monthData) {
                    const existingIndex = state.months.findIndex(
                        (item) => item.id === monthData.id
                    );

                    if (existingIndex >= 0) {
                        state.months[existingIndex] = monthData;
                    } else {
                        state.months.push(monthData);
                    }
                }
            })

            .addCase(fetchBudgetMonth.rejected, (state, action) => {
                state.monthLoading = false;
                state.error = action.payload || action.error.message;
            })

            /* -----------------------------------------
               FETCH CATEGORIES
            ----------------------------------------- */

            .addCase(fetchBudgetCategories.pending, (state) => {
                state.categoriesLoading = true;
                state.error = null;
            })

            .addCase(fetchBudgetCategories.fulfilled, (state, action) => {
                state.categoriesLoading = false;
                state.categories = action.payload || [];
            })

            .addCase(fetchBudgetCategories.rejected, (state, action) => {
                state.categoriesLoading = false;
                state.error = action.payload || action.error.message;
            })

            /* -----------------------------------------
               CREATE CATEGORY
            ----------------------------------------- */

            .addCase(createBudgetCategory.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(createBudgetCategory.fulfilled, (state, action) => {
                state.saving = false;
                state.categories.push(action.payload);
            })

            .addCase(createBudgetCategory.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload || action.error.message;
            })

            /* -----------------------------------------
               UPDATE CATEGORY
            ----------------------------------------- */

            .addCase(updateBudgetCategory.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(updateBudgetCategory.fulfilled, (state, action) => {
                state.saving = false;
                state.categories = updateById(
                    state.categories,
                    action.payload
                );
            })

            .addCase(updateBudgetCategory.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload || action.error.message;
            })

            /* -----------------------------------------
               DELETE CATEGORY
            ----------------------------------------- */

            .addCase(deleteBudgetCategory.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(deleteBudgetCategory.fulfilled, (state, action) => {
                state.saving = false;
                state.categories = removeById(
                    state.categories,
                    action.payload
                );
            })

            .addCase(deleteBudgetCategory.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload || action.error.message;
            })

            /* -----------------------------------------
               CREATE INCOME
            ----------------------------------------- */

            .addCase(createBudgetIncome.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(createBudgetIncome.fulfilled, (state, action) => {
                state.saving = false;
                state.incomes.push(action.payload);
            })

            .addCase(createBudgetIncome.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload || action.error.message;
            })

            /* -----------------------------------------
               UPDATE INCOME
            ----------------------------------------- */

            .addCase(updateBudgetIncome.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(updateBudgetIncome.fulfilled, (state, action) => {
                state.saving = false;
                state.incomes = updateById(
                    state.incomes,
                    action.payload
                );
            })

            .addCase(updateBudgetIncome.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload || action.error.message;
            })

            /* -----------------------------------------
               DELETE INCOME
            ----------------------------------------- */

            .addCase(deleteBudgetIncome.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(deleteBudgetIncome.fulfilled, (state, action) => {
                state.saving = false;
                state.incomes = removeById(
                    state.incomes,
                    action.payload
                );
            })

            .addCase(deleteBudgetIncome.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload || action.error.message;
            })

            /* -----------------------------------------
               CREATE BUDGET ITEM
            ----------------------------------------- */

            .addCase(createBudgetItem.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(createBudgetItem.fulfilled, (state, action) => {
                state.saving = false;
                state.budgetItems.push(action.payload);
            })

            .addCase(createBudgetItem.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload || action.error.message;
            })

            /* -----------------------------------------
               UPDATE BUDGET ITEM
            ----------------------------------------- */

            .addCase(updateBudgetItem.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(updateBudgetItem.fulfilled, (state, action) => {
                state.saving = false;
                state.budgetItems = updateById(
                    state.budgetItems,
                    action.payload
                );
            })

            .addCase(updateBudgetItem.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload || action.error.message;
            })

            /* -----------------------------------------
               DELETE BUDGET ITEM
            ----------------------------------------- */

            .addCase(deleteBudgetItem.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(deleteBudgetItem.fulfilled, (state, action) => {
                state.saving = false;
                state.budgetItems = removeById(
                    state.budgetItems,
                    action.payload
                );
            })

            .addCase(deleteBudgetItem.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export const {
    clearBudgetError,
    clearSelectedBudgetMonth,
    setSelectedBudgetYear,
} = budgetSlice.actions;

export default budgetSlice.reducer;
