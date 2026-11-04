
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { transactionService } from "../../services/transactionService";

// Fetch transactions from Supabase
export const fetchTransactions = createAsyncThunk(
    "transactions/fetchTransactions",
    async (_, { rejectWithValue }) => {
        try {
            return await transactionService.getAll();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    items: [],
    loading: false,
    error: null,
};

const transactionSlice = createSlice({
    name: "transactions",
    initialState,

    reducers: {
        setTransactions: (state, action) => {
            state.items = action.payload;
        },

        addTransaction: (state, action) => {
            state.items.unshift(action.payload);
        },

        updateTransaction: (state, action) => {
            const index = state.items.findIndex(
                (item) => item.id === action.payload.id
            );

            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },

        deleteTransaction: (state, action) => {
            state.items = state.items.filter(
                (item) => item.id !== action.payload
            );
        },

        clearTransactions: (state) => {
            state.items = [];
        },
    },

    // Handle asynchronous Supabase requests
    extraReducers: (builder) => {
        builder
            .addCase(fetchTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })

            .addCase(fetchTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch transactions";
            });
    },
});

export const {
    setTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearTransactions,
} = transactionSlice.actions;

export default transactionSlice.reducer;
