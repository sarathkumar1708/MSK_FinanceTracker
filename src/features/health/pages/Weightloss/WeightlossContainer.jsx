
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Weightloss from "./Weightloss";

import {
    fetchWeightlossData,
    createJourney,
    updateJourney,
    deleteJourney,
} from "../../store/healthSlice";

export default function WeightlossContainer() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        journeys = [],
        loading,
        saving,
        error,
    } = useSelector((state) => state.health);

    const [activeTab, setActiveTab] = useState("pending");
    const [searchTerm, setSearchTerm] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJourney, setSelectedJourney] = useState(null);

    useEffect(() => {
        dispatch(fetchWeightlossData());
    }, [dispatch]);

    const handleCreate = useCallback(() => {
        setSelectedJourney(null);
        setIsModalOpen(true);
    }, []);

    const handleEdit = useCallback((journey) => {
        setSelectedJourney(journey);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        if (saving) return;

        setIsModalOpen(false);
        setSelectedJourney(null);
    }, [saving]);

    const handleSubmitJourney = async (payload) => {
        try {
            if (selectedJourney) {
                await dispatch(
                    updateJourney({
                        id: selectedJourney.id,
                        payload,
                    })
                ).unwrap();
            } else {
                await dispatch(createJourney(payload)).unwrap();
                setActiveTab("pending");
                setSearchTerm("");
            }

            setIsModalOpen(false);
            setSelectedJourney(null);
        } catch (err) {
            console.error("Journey save failed:", err);
        }
    };

    const handleDeleteJourney = async (journey) => {
        const confirmed = window.confirm(
            `Delete "${journey.journey_name}" and all its weight transactions?`
        );

        if (!confirmed) return;

        try {
            await dispatch(deleteJourney(journey.id)).unwrap();
        } catch (err) {
            console.error("Journey delete failed:", err);
        }
    };

    const handleStatusChange = async (journey, status) => {
        try {
            await dispatch(
                updateJourney({
                    id: journey.id,
                    payload: { status },
                })
            ).unwrap();
        } catch (err) {
            console.error("Journey status update failed:", err);
        }
    };

    const handleOpenJourney = (journey) => {
        navigate(`/health/weightloss/${journey.id}/transactions`);
    };

    return (
        <Weightloss
            journeys={journeys}
            loading={loading}
            saving={saving}
            error={error}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isModalOpen={isModalOpen}
            selectedJourney={selectedJourney}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onCloseModal={handleCloseModal}
            onSubmitJourney={handleSubmitJourney}
            onOpenJourney={handleOpenJourney}
            onDeleteJourney={handleDeleteJourney}
            onStatusChange={handleStatusChange}
        />
    );
}
