
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { roleService } from "../../services/roleService";

export const fetchMyPermissions = createAsyncThunk(
    "permissions/fetchMyPermissions",
    async (_, { rejectWithValue }) => {
        try {
            return await roleService.getMyPermissions();
        } catch (error) {
            return rejectWithValue(error.message || "Failed to load permissions");
        }
    }
);

const initialState = {
    userId: null,
    isAdmin: false,
    componentKeys: [],
    loading: true,
    error: null,
};

const permissionSlice = createSlice({
    name: "permissions",
    initialState,
    reducers: {
        clearPermissions: () => ({
            ...initialState,
            loading: false,
        }),
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyPermissions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyPermissions.fulfilled, (state, action) => {
                state.loading = false;
                state.userId = action.payload.userId;
                state.isAdmin = action.payload.isAdmin;
                state.componentKeys = action.payload.componentKeys;
            })
            .addCase(fetchMyPermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Unable to load permissions";
            });
    },
});

export const { clearPermissions } = permissionSlice.actions;

export const selectIsAdmin = (state) => state.permissions.isAdmin;
export const selectPermissionKeys = (state) =>
    state.permissions.componentKeys;
export const selectPermissionLoading = (state) =>
    state.permissions.loading;

export const selectHasPermission = (componentKey) => (state) => {
    const { isAdmin, componentKeys } = state.permissions;

    return isAdmin || componentKeys.includes("*") ||
        componentKeys.includes(componentKey);
};

export default permissionSlice.reducer;
