import { configureStore } from "@reduxjs/toolkit";

import transactionReducer from "../features/transactions/transactionSlice";
import authReducer from "../features/auth/authSlice";
import permissionReducer from "../features/permissions/permissionSlice";
import debtReducer from "../features/debt/debtSlice";
import goalReducer from "../features/goals/goalSlice";


export const store = configureStore({
    reducer: {
        transactions: transactionReducer,
        auth: authReducer,
        permissions: permissionReducer,
        debt: debtReducer,
        goals: goalReducer,
    },
});