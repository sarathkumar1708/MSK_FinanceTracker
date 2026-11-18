
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import MealsPlanner from "./MealsPlanner";

import {
    fetchMealJourneys,
    createMealJourney,
    updateMealJourney,
    deleteMealJourney,
} from "../../store/mealPlannerSlice";

function MealsPlannerContainer() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        journeys = [],
        loading,
        saving,
        error,
    } = useSelector((state) => state.mealPlanner);

    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJourney, setEditingJourney] = useState(null);
    const [actionError, setActionError] = useState("");

    useEffect(() => {
        dispatch(fetchMealJourneys());
    }, [dispatch]);

    const handleOpenCreate = useCallback(() => {
        setEditingJourney(null);
        setActionError("");
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        if (saving) return;

        setIsModalOpen(false);
        setEditingJourney(null);
    }, [saving]);

    const handleEditJourney = useCallback((journey) => {
        setEditingJourney(journey);
        setActionError("");
        setIsModalOpen(true);
    }, []);

    const handleSubmitJourney = async (payload) => {
        setActionError("");

        try {
            if (editingJourney) {
                await dispatch(
                    updateMealJourney({
                        id: editingJourney.id,
                        ...payload,
                    })
                ).unwrap();
            } else {
                await dispatch(createMealJourney(payload)).unwrap();
            }

            setIsModalOpen(false);
            setEditingJourney(null);
        } catch (err) {
            const message =
                typeof err === "string"
                    ? err
                    : "Unable to save the meal journey.";

            setActionError(message);
            throw err;
        }
    };

    const handleDeleteJourney = async (journey) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${journey.journey_name}"?\n\nAll weekly meal plans and food items in this journey will also be deleted.`
        );

        if (!confirmed) return;

        setActionError("");

        try {
            await dispatch(deleteMealJourney(journey.id)).unwrap();
        } catch (err) {
            setActionError(
                typeof err === "string"
                    ? err
                    : "Unable to delete the meal journey."
            );
        }
    };

    const handleOpenJourney = (journey) => {
        navigate(`/health/meals-planner/${journey.id}`);
    };

    return (
        <MealsPlanner
            journeys={journeys}
            loading={loading}
            saving={saving}
            error={actionError || error}
            filter={filter}
            onFilterChange={setFilter}
            search={search}
            onSearchChange={setSearch}
            isModalOpen={isModalOpen}
            editingJourney={editingJourney}
            onOpenCreate={handleOpenCreate}
            onCloseModal={handleCloseModal}
            onSubmitJourney={handleSubmitJourney}
            onEditJourney={handleEditJourney}
            onDeleteJourney={handleDeleteJourney}
            onOpenJourney={handleOpenJourney}
        />
    );
}

export default MealsPlannerContainer;
