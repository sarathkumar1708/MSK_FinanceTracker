
import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import WeightTransactions from "./WeightTransactions";

import {
    fetchWeightlossData,
    saveWeightTransaction,
    deleteWeightTransaction,
} from "../../store/healthSlice";

function WeightTransactionsContainer() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { journeyId } = useParams();

    const {
        journeys = [],
        transactions = [],
        loading = false,
        saving = false,
    } = useSelector((state) => state.health || {});

    useEffect(() => {
        dispatch(fetchWeightlossData());
    }, [dispatch]);

    const journey = useMemo(
        () => journeys.find((item) => item.id === journeyId),
        [journeys, journeyId]
    );

    const journeyTransactions = useMemo(
        () => transactions.filter((item) => item.journey_id === journeyId),
        [transactions, journeyId]
    );

    const handleSaveWeight = async (payload) => {
        await dispatch(saveWeightTransaction(payload)).unwrap();
    };

    const handleDeleteWeight = async (transaction) => {
        if (!transaction?.id) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this weight record?"
        );

        if (!confirmed) return;

        try {
            await dispatch(deleteWeightTransaction(transaction.id)).unwrap();
        } catch (error) {
            console.error("Unable to delete weight record:", error);
        }
    };

    const handleBack = () => {
        navigate("/health/weightloss");
    };

    return (
        <WeightTransactions
            journey={journey}
            transactions={journeyTransactions}
            loading={loading}
            saving={saving}
            onBack={handleBack}
            onSaveWeight={handleSaveWeight}
            onDeleteWeight={handleDeleteWeight}
        />
    );
}

export default WeightTransactionsContainer;
