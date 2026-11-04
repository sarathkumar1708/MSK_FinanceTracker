import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    session: null,
    loading: true,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,

    reducers: {
        setSession: (state, action) => {
            state.session = action.payload;
            state.user = action.payload?.user ?? null;
            state.loading = false;
            state.error = null;
        },

        setAuthLoading: (state, action) => {
            state.loading = action.payload;
        },

        setAuthError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },

        clearAuth: (state) => {
            state.user = null;
            state.session = null;
            state.loading = false;
            state.error = null;
        },
    },
});

export const {
    setSession,
    setAuthLoading,
    setAuthError,
    clearAuth,
} = authSlice.actions;

export default authSlice.reducer;