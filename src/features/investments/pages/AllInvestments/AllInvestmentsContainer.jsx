
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    fetchInvestmentData,
    createInvestment,
    updateInvestment,
    deleteInvestment,
    closeInvestment,
} from "../../investmentSlice";

import AllInvestments from "./AllInvestments";

export default function AllInvestmentsContainer() {
    const dispatch = useDispatch();

    console.log("all investment")

    const {
        investments = [],
        transactions = [],
        monthlySnapshots = [],
        loading = false,
        saving = false,
        error = null,
    } = useSelector((state) => state.investment);

    useEffect(() => {
        dispatch(fetchInvestmentData());
    }, [dispatch]);

    const handleAdd = async (payload) => {
        await dispatch(createInvestment(payload)).unwrap();
    };

    const handleEdit = async (id, updates) => {
        await dispatch(updateInvestment({ id, updates })).unwrap();
    };

    const handleDelete = async (id) => {
        await dispatch(deleteInvestment(id)).unwrap();
    };

    const handleClose = async (id) => {
        await dispatch(closeInvestment(id)).unwrap();
    };

    return (
        <AllInvestments
            investments={investments}
            transactions={transactions}
            monthlySnapshots={monthlySnapshots}
            loading={loading}
            saving={saving}
            error={error}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClose={handleClose}
        />
    );
}
