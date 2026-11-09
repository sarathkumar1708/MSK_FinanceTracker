
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import MonthlyDebtUpdate from "../MonthlyDebtUpdate";

import {
    fetchDebtData,
    saveMonthlySnapshot,
    createPayment,
    updatePayment,
    deletePayment
} from "../../../debtSlice";

export default function MonthlyDebtUpdateContainer() {
    const dispatch = useDispatch();

    const {
        debts,
        monthlySnapshots,
        payments,
        loading,
    } = useSelector((state) => state.debt);

    useEffect(() => {
        dispatch(fetchDebtData());
    }, [dispatch]);

    const handleSave = async (snapshot) => {
        await dispatch(saveMonthlySnapshot(snapshot)).unwrap();
    };

    const handlePayment = async (paymentData) => {
        await dispatch(createPayment(paymentData)).unwrap();
    };



    return (
        <MonthlyDebtUpdate
            debts={debts}
            monthlySnapshots={monthlySnapshots}
            payments={payments}
            onSave={handleSave}
            onPayment={handlePayment}
            paymentSaving={loading}
            onUpdatePayment={(payload) =>
                dispatch(updatePayment(payload)).unwrap()
            }
            onDeletePayment={(id) =>
                dispatch(deletePayment(id)).unwrap()
            }
        />
    );
}
