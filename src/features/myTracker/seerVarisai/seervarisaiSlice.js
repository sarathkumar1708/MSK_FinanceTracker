
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import seervarisaiService from "./services/seervarisaiService";

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
    families: [],
    members: [],
    transactions: [],

    loading: false,
    saving: false,

    error: null,
};


// ============================================
// FETCH DATA
// ============================================

export const fetchSeervarisaiData = createAsyncThunk(
    "seervarisai/fetchData",
    async (_, { rejectWithValue }) => {
        try {
            return await seervarisaiService.fetchSeervarisaiData();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


// ============================================
// FAMILY THUNKS
// ============================================

export const createFamily = createAsyncThunk(
    "seervarisai/createFamily",
    async (familyData, { rejectWithValue }) => {
        try {
            return await seervarisaiService.createFamily(familyData);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateFamily = createAsyncThunk(
    "seervarisai/updateFamily",
    async ({ familyId, familyData }, { rejectWithValue }) => {
        try {
            return await seervarisaiService.updateFamily(
                familyId,
                familyData
            );
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteFamily = createAsyncThunk(
    "seervarisai/deleteFamily",
    async (familyId, { rejectWithValue }) => {
        try {
            return await seervarisaiService.deleteFamily(familyId);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


// ============================================
// MEMBER THUNKS
// ============================================

export const createMember = createAsyncThunk(
    "seervarisai/createMember",
    async (memberData, { rejectWithValue }) => {
        try {
            return await seervarisaiService.createMember(memberData);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateMember = createAsyncThunk(
    "seervarisai/updateMember",
    async ({ memberId, memberData }, { rejectWithValue }) => {
        try {
            return await seervarisaiService.updateMember(
                memberId,
                memberData
            );
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteMember = createAsyncThunk(
    "seervarisai/deleteMember",
    async (memberId, { rejectWithValue }) => {
        try {
            return await seervarisaiService.deleteMember(memberId);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


// ============================================
// TRANSACTION THUNKS
// ============================================

export const createTransaction = createAsyncThunk(
    "seervarisai/createTransaction",
    async (transactionData, { rejectWithValue }) => {
        try {
            return await seervarisaiService.createTransaction(
                transactionData
            );
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateTransaction = createAsyncThunk(
    "seervarisai/updateTransaction",
    async (
        { transactionId, transactionData },
        { rejectWithValue }
    ) => {
        try {
            return await seervarisaiService.updateTransaction(
                transactionId,
                transactionData
            );
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteTransaction = createAsyncThunk(
    "seervarisai/deleteTransaction",
    async (transactionId, { rejectWithValue }) => {
        try {
            return await seervarisaiService.deleteTransaction(
                transactionId
            );
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


// ============================================
// HELPER: UPSERT REDUX ARRAY ITEM
// ============================================

const upsertItem = (items, newItem) => {
    const index = items.findIndex(
        (item) => item.id === newItem.id
    );

    if (index >= 0) {
        items[index] = newItem;
    } else {
        items.unshift(newItem);
    }
};


// ============================================
// SLICE
// ============================================

const seervarisaiSlice = createSlice({
    name: "seervarisai",
    initialState,

    reducers: {
        clearSeervarisaiError: (state) => {
            state.error = null;
        },

        resetSeervarisaiState: () => initialState,
    },

    extraReducers: (builder) => {
        builder

            // ------------------------------------
            // FETCH ALL DATA
            // ------------------------------------

            .addCase(fetchSeervarisaiData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchSeervarisaiData.fulfilled, (state, action) => {
                state.loading = false;

                state.families = action.payload.families;
                state.members = action.payload.members;
                state.transactions = action.payload.transactions;
            })

            .addCase(fetchSeervarisaiData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })


            // ------------------------------------
            // FAMILY CRUD
            // ------------------------------------

            .addCase(createFamily.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(createFamily.fulfilled, (state, action) => {
                state.saving = false;
                upsertItem(state.families, action.payload);
            })

            .addCase(createFamily.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload || action.error.message;
            })

            .addCase(updateFamily.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(updateFamily.fulfilled, (state, action) => {
                state.saving = false;
                upsertItem(state.families, action.payload);
            })

            .addCase(updateFamily.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload || action.error.message;
            })

            .addCase(deleteFamily.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(deleteFamily.fulfilled, (state, action) => {
                state.saving = false;

                const familyId = action.payload;

                const memberIds = state.members
                    .filter((member) => member.family_id === familyId)
                    .map((member) => member.id);

                state.families = state.families.filter(
                    (family) => family.id !== familyId
                );

                state.members = state.members.filter(
                    (member) => member.family_id !== familyId
                );

                state.transactions = state.transactions.filter(
                    (transaction) => !memberIds.includes(transaction.member_id)
                );
            })

            .addCase(deleteFamily.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload || action.error.message;
            })


            // ------------------------------------
            // MEMBER CRUD
            // ------------------------------------

            .addCase(createMember.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(createMember.fulfilled, (state, action) => {
                state.saving = false;
                upsertItem(state.members, action.payload);
            })

            .addCase(createMember.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload || action.error.message;
            })

            .addCase(updateMember.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(updateMember.fulfilled, (state, action) => {
                state.saving = false;
                upsertItem(state.members, action.payload);
            })

            .addCase(updateMember.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload || action.error.message;
            })

            .addCase(deleteMember.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(deleteMember.fulfilled, (state, action) => {
                state.saving = false;

                const memberId = action.payload;

                state.members = state.members.filter(
                    (member) => member.id !== memberId
                );

                state.transactions = state.transactions.filter(
                    (transaction) => transaction.member_id !== memberId
                );
            })

            .addCase(deleteMember.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload || action.error.message;
            })


            // ------------------------------------
            // TRANSACTION CRUD
            // ------------------------------------

            .addCase(createTransaction.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(createTransaction.fulfilled, (state, action) => {
                state.saving = false;
                upsertItem(state.transactions, action.payload);
            })

            .addCase(createTransaction.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload || action.error.message;
            })

            .addCase(updateTransaction.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(updateTransaction.fulfilled, (state, action) => {
                state.saving = false;
                upsertItem(state.transactions, action.payload);
            })

            .addCase(updateTransaction.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload || action.error.message;
            })

            .addCase(deleteTransaction.pending, (state) => {
                state.saving = true;
                state.error = null;
            })

            .addCase(deleteTransaction.fulfilled, (state, action) => {
                state.saving = false;

                state.transactions = state.transactions.filter(
                    (transaction) => transaction.id !== action.payload
                );
            })

            .addCase(deleteTransaction.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload || action.error.message;
            });
    },
});


// ============================================
// EXPORTS
// ============================================

export const {
    clearSeervarisaiError,
    resetSeervarisaiState,
} = seervarisaiSlice.actions;


// Selectors
export const selectSeervarisaiFamilies = (state) =>
    state.seervarisai.families;

export const selectSeervarisaiMembers = (state) =>
    state.seervarisai.members;

export const selectSeervarisaiTransactions = (state) =>
    state.seervarisai.transactions;

export const selectSeervarisaiLoading = (state) =>
    state.seervarisai.loading;

export const selectSeervarisaiSaving = (state) =>
    state.seervarisai.saving;

export const selectSeervarisaiError = (state) =>
    state.seervarisai.error;

export default seervarisaiSlice.reducer;
