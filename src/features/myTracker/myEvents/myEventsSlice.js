
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import myEventsService from "./services/myEventsService";

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
    events: [],
    eventInstances: [],
    transactions: [],

    loading: false,
    saving: false,

    error: null,
};

// ============================================
// COMMON ERROR HANDLER
// ============================================

const getErrorMessage = (error) =>
    error?.message || "Something went wrong. Please try again.";

// ============================================
// 1. PARENT EVENT THUNKS
// ============================================

export const fetchEvents = createAsyncThunk(
    "myEvents/fetchEvents",
    async (_, { rejectWithValue }) => {
        try {
            return await myEventsService.fetchEvents();
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const createEvent = createAsyncThunk(
    "myEvents/createEvent",
    async (eventData, { rejectWithValue }) => {
        try {
            return await myEventsService.createEvent(eventData);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const updateEvent = createAsyncThunk(
    "myEvents/updateEvent",
    async ({ eventId, eventData }, { rejectWithValue }) => {
        try {
            return await myEventsService.updateEvent(
                eventId,
                eventData
            );
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const deleteEvent = createAsyncThunk(
    "myEvents/deleteEvent",
    async (eventId, { rejectWithValue }) => {
        try {
            await myEventsService.deleteEvent(eventId);
            return eventId;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// ============================================
// 2. CHILD EVENT THUNKS
// ============================================

export const fetchEventInstances = createAsyncThunk(
    "myEvents/fetchEventInstances",
    async (eventId, { rejectWithValue }) => {
        try {
            return await myEventsService.fetchEventInstances(eventId);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const createEventInstance = createAsyncThunk(
    "myEvents/createEventInstance",
    async (instanceData, { rejectWithValue }) => {
        try {
            return await myEventsService.createEventInstance(instanceData);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const updateEventInstance = createAsyncThunk(
    "myEvents/updateEventInstance",
    async ({ instanceId, instanceData }, { rejectWithValue }) => {
        try {
            return await myEventsService.updateEventInstance(
                instanceId,
                instanceData
            );
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const deleteEventInstance = createAsyncThunk(
    "myEvents/deleteEventInstance",
    async (instanceId, { rejectWithValue }) => {
        try {
            await myEventsService.deleteEventInstance(instanceId);
            return instanceId;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// ============================================
// 3. EVENT TRANSACTION THUNKS
// ============================================

export const fetchEventTransactions = createAsyncThunk(
    "myEvents/fetchEventTransactions",
    async (instanceId, { rejectWithValue }) => {
        try {
            return await myEventsService.fetchEventTransactions(instanceId);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const createEventTransaction = createAsyncThunk(
    "myEvents/createEventTransaction",
    async (transactionData, { rejectWithValue }) => {
        try {
            return await myEventsService.createEventTransaction(
                transactionData
            );
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const updateEventTransaction = createAsyncThunk(
    "myEvents/updateEventTransaction",
    async ({ transactionId, transactionData }, { rejectWithValue }) => {
        try {
            return await myEventsService.updateEventTransaction(
                transactionId,
                transactionData
            );
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const deleteEventTransaction = createAsyncThunk(
    "myEvents/deleteEventTransaction",
    async (transactionId, { rejectWithValue }) => {
        try {
            await myEventsService.deleteEventTransaction(transactionId);
            return transactionId;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// ============================================
// REDUX SLICE
// ============================================

const myEventsSlice = createSlice({
    name: "myEvents",
    initialState,

    reducers: {
        clearMyEventsError: (state) => {
            state.error = null;
        },

        clearEventInstances: (state) => {
            state.eventInstances = [];
        },

        clearEventTransactions: (state) => {
            state.transactions = [];
        },

        resetMyEvents: () => initialState,
    },

    extraReducers: (builder) => {
        // ====================================
        // PARENT EVENTS
        // ====================================

        builder
            .addCase(fetchEvents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEvents.fulfilled, (state, action) => {
                state.loading = false;
                state.events = action.payload;
            })
            .addCase(fetchEvents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(createEvent.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createEvent.fulfilled, (state, action) => {
                state.saving = false;
                state.events.unshift(action.payload);
            })
            .addCase(createEvent.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            })

            .addCase(updateEvent.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateEvent.fulfilled, (state, action) => {
                state.saving = false;

                const index = state.events.findIndex(
                    (item) => item.id === action.payload.id
                );

                if (index !== -1) {
                    state.events[index] = {
                        ...state.events[index],
                        ...action.payload,
                    };
                }
            })
            .addCase(updateEvent.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            })

            .addCase(deleteEvent.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(deleteEvent.fulfilled, (state, action) => {
                state.saving = false;

                state.events = state.events.filter(
                    (item) => item.id !== action.payload
                );

                state.eventInstances = state.eventInstances.filter(
                    (item) => item.event_id !== action.payload
                );

                state.transactions = [];
            })
            .addCase(deleteEvent.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            });

        // ====================================
        // CHILD EVENTS
        // ====================================

        builder
            .addCase(fetchEventInstances.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.eventInstances = [];
            })
            .addCase(fetchEventInstances.fulfilled, (state, action) => {
                state.loading = false;
                state.eventInstances = action.payload;
            })
            .addCase(fetchEventInstances.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(createEventInstance.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createEventInstance.fulfilled, (state, action) => {
                state.saving = false;
                state.eventInstances.unshift(action.payload);

                const parentEvent = state.events.find(
                    (item) => item.id === action.payload.event_id
                );

                if (parentEvent) {
                    parentEvent.instance_count =
                        (parentEvent.instance_count || 0) + 1;
                }
            })
            .addCase(createEventInstance.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            })

            .addCase(updateEventInstance.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateEventInstance.fulfilled, (state, action) => {
                state.saving = false;

                const index = state.eventInstances.findIndex(
                    (item) => item.id === action.payload.id
                );

                if (index !== -1) {
                    state.eventInstances[index] = {
                        ...state.eventInstances[index],
                        ...action.payload,
                    };
                }
            })
            .addCase(updateEventInstance.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            })

            .addCase(deleteEventInstance.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(deleteEventInstance.fulfilled, (state, action) => {
                state.saving = false;

                const deletedInstance = state.eventInstances.find(
                    (item) => item.id === action.payload
                );

                if (deletedInstance) {
                    const parentEvent = state.events.find(
                        (item) => item.id === deletedInstance.event_id
                    );

                    if (parentEvent) {
                        parentEvent.instance_count = Math.max(
                            0,
                            (parentEvent.instance_count || 0) - 1
                        );
                    }
                }

                state.eventInstances = state.eventInstances.filter(
                    (item) => item.id !== action.payload
                );

                state.transactions = [];
            })
            .addCase(deleteEventInstance.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            });

        // ====================================
        // EVENT TRANSACTIONS
        // ====================================

        builder
            .addCase(fetchEventTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.transactions = [];
            })
            .addCase(fetchEventTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload;
            })
            .addCase(fetchEventTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(createEventTransaction.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createEventTransaction.fulfilled, (state, action) => {
                state.saving = false;
                state.transactions.unshift(action.payload);

                const instance = state.eventInstances.find(
                    (item) =>
                        item.id === action.payload.event_instance_id
                );

                if (instance) {
                    instance.transaction_count =
                        (instance.transaction_count || 0) + 1;
                }
            })
            .addCase(createEventTransaction.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            })

            .addCase(updateEventTransaction.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateEventTransaction.fulfilled, (state, action) => {
                state.saving = false;

                const index = state.transactions.findIndex(
                    (item) => item.id === action.payload.id
                );

                if (index !== -1) {
                    state.transactions[index] = {
                        ...state.transactions[index],
                        ...action.payload,
                    };
                }
            })
            .addCase(updateEventTransaction.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            })

            .addCase(deleteEventTransaction.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(deleteEventTransaction.fulfilled, (state, action) => {
                state.saving = false;

                const deletedTransaction = state.transactions.find(
                    (item) => item.id === action.payload
                );

                if (deletedTransaction) {
                    const instance = state.eventInstances.find(
                        (item) =>
                            item.id === deletedTransaction.event_instance_id
                    );

                    if (instance) {
                        instance.transaction_count = Math.max(
                            0,
                            (instance.transaction_count || 0) - 1
                        );
                    }
                }

                state.transactions = state.transactions.filter(
                    (item) => item.id !== action.payload
                );
            })
            .addCase(deleteEventTransaction.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            });
    },
});

// ============================================
// ACTIONS
// ============================================

export const {
    clearMyEventsError,
    clearEventInstances,
    clearEventTransactions,
    resetMyEvents,
} = myEventsSlice.actions;

// ============================================
// SELECTORS
// ============================================

export const selectMyEvents = (state) =>
    state.myEvents?.events || [];

export const selectMyEventInstances = (state) =>
    state.myEvents?.eventInstances || [];

export const selectMyEventTransactions = (state) =>
    state.myEvents?.transactions || [];

export const selectMyEventsLoading = (state) =>
    state.myEvents?.loading || false;

export const selectMyEventsSaving = (state) =>
    state.myEvents?.saving || false;

export const selectMyEventsError = (state) =>
    state.myEvents?.error || null;

// ============================================
// REDUCER
// ============================================

export default myEventsSlice.reducer;
