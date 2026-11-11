
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    fetchInvestmentData,
    createInvestmentTransaction,
    updateInvestmentTransaction,
    deleteInvestmentTransaction,
    saveInvestmentSnapshot,
} from "../../investmentSlice";

import MonthlyInvestment from "./MonthlyInvestment";

export default function MonthlyInvestmentContainer() {
    const dispatch = useDispatch();

    const {
        investments,
        transactions,
        monthlySnapshots,
        loading,
        transactionSaving,
        snapshotSaving,
    } = useSelector((state) => state.investment);

    useEffect(() => {
        dispatch(fetchInvestmentData());
    }, [dispatch]);

    const handleCreateTransaction = (payload) =>
        dispatch(createInvestmentTransaction(payload)).unwrap();

    const handleSaveSnapshot = (payload) =>
        dispatch(saveInvestmentSnapshot(payload)).unwrap();

    const handleUpdateTransaction = (id, updates) =>
        dispatch(
            updateInvestmentTransaction({ id, updates })
        ).unwrap();

    const handleDeleteTransaction = (id) =>
        dispatch(deleteInvestmentTransaction(id)).unwrap();

    return (
        <MonthlyInvestment
            investments={investments}
            transactions={transactions}
            monthlySnapshots={monthlySnapshots}
            loading={loading}
            transactionSaving={transactionSaving}
            snapshotSaving={snapshotSaving}
            onCreateTransaction={handleCreateTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onSaveSnapshot={handleSaveSnapshot}
        />
    );
}
