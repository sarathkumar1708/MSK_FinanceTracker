
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    fetchDebtData,
    createDebt,
    updateDebt,
    deleteDebt,
    closeDebt
} from "../debtSlice";

import AllDebts from "./AllDebts/AllDebts";

export default function AllDebtsContainer() {
    const dispatch = useDispatch();

    const {
        debts,
        monthlySnapshots,
        payments,
        saving,
        loading,
        error,
    } = useSelector((state) => state.debt);

    useEffect(() => {
        dispatch(fetchDebtData());
    }, [dispatch]);

    const handleAddDebt = async (debtData) => {
        await dispatch(createDebt(debtData)).unwrap();
    };

    const handleEditDebt = async (id, updates) => {
        await dispatch(updateDebt({ id, updates })).unwrap();
    };

    const handleDeleteDebt = async (debt) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${debt.name}"?`
        );

        if (!confirmed) return;

        try {
            await dispatch(deleteDebt(debt.id)).unwrap();
        } catch (error) {
            window.alert(
                error?.message ||
                "Unable to delete this debt. It may have historical records."
            );
        }
    };

    const handleClose = async (debt) => {
        const confirmed = window.confirm(
            `Are you sure you want to close "${debt.name}"?`
        );

        if (!confirmed) return;

        try {
            await dispatch(closeDebt(debt.id)).unwrap();
            await dispatch(fetchDebtData());
        } catch (error) {
            alert(error || "Unable to close debt.");
        }
    };

    return (
        <>
            {error && <p className="debt-error">{error}</p>}

            <AllDebts
                debts={debts}
                monthlySnapshots={monthlySnapshots}
                payments={payments}
                saving={saving}
                loading={loading}
                onAdd={handleAddDebt}
                onEdit={handleEditDebt}
                onDelete={handleDeleteDebt}
                onClose={handleClose}
            />
        </>
    );
}
