
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import MealWeek from "./MealWeek";

import {
    fetchMealJourneys,
    fetchMealPlans,
} from "../../store/mealPlannerSlice";

// =====================================================
// DATE HELPERS
// =====================================================

function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getMonday(date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);

    const day = result.getDay();
    const difference = day === 0 ? -6 : 1 - day;

    result.setDate(result.getDate() + difference);

    return result;
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function MealWeekContainer() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { journeyId } = useParams();

    const {
        journeys = [],
        mealPlans = [],
        loading,
        error,
    } = useSelector((state) => state.mealPlanner);

    const [weekStart, setWeekStart] = useState(null);

    const journey = journeys.find((item) => item.id === journeyId);

    // ---------------------------------------------
    // LOAD JOURNEYS
    // ---------------------------------------------

    useEffect(() => {
        if (!journeys.length) {
            dispatch(fetchMealJourneys());
        }
    }, [dispatch, journeys.length]);

    // ---------------------------------------------
    // INITIALISE WEEK FROM JOURNEY START DATE
    // ---------------------------------------------

    useEffect(() => {
        if (journey) {
            setWeekStart(getMonday(parseLocalDate(journey.from_date)));
        }
    }, [journeyId, journey?.from_date]);

    // ---------------------------------------------
    // WEEK DATES
    // ---------------------------------------------

    const weekDates = useMemo(() => {
        if (!weekStart) return [];

        return Array.from({ length: 7 }, (_, index) =>
            addDays(weekStart, index)
        );
    }, [weekStart]);

    const weekEnd = weekDates[6];

    // ---------------------------------------------
    // FETCH MEALS FOR SELECTED WEEK
    // ---------------------------------------------

    useEffect(() => {
        if (!journey || !weekStart || !weekEnd) return;

        dispatch(
            fetchMealPlans({
                journeyId: journey.id,
                startDate: formatLocalDate(weekStart),
                endDate: formatLocalDate(weekEnd),
            })
        );
    }, [dispatch, journey?.id, weekStart, weekEnd]);

    // ---------------------------------------------
    // WEEK NAVIGATION LIMITS
    // ---------------------------------------------

    const canGoPrevious = useMemo(() => {
        if (!journey || !weekStart) return false;

        const previousWeekEnd = addDays(weekStart, -1);

        return (
            formatLocalDate(previousWeekEnd) >= journey.from_date
        );
    }, [journey, weekStart]);

    const canGoNext = useMemo(() => {
        if (!journey || !weekStart) return false;

        const nextWeekStart = addDays(weekStart, 7);

        return (
            formatLocalDate(nextWeekStart) <= journey.to_date
        );
    }, [journey, weekStart]);

    const handlePreviousWeek = useCallback(() => {
        if (!canGoPrevious || !weekStart) return;

        setWeekStart((previous) => addDays(previous, -7));
    }, [canGoPrevious, weekStart]);

    const handleNextWeek = useCallback(() => {
        if (!canGoNext || !weekStart) return;

        setWeekStart((previous) => addDays(previous, 7));
    }, [canGoNext, weekStart]);

    // ---------------------------------------------
    // NAVIGATION
    // ---------------------------------------------

    const handleBack = () => {
        navigate("/health/meals-planner");
    };

    const handleOpenDay = (date) => {
        navigate(`/health/meals-planner/${journeyId}/${date}`);
    };

    // ---------------------------------------------
    // INVALID JOURNEY
    // ---------------------------------------------

    if (!journey && !loading) {
        return (
            <div className="meal-week-error-state">
                <h2>Meal journey not found</h2>
                <p>
                    {error || "The selected journey could not be found."}
                </p>
                <button type="button" onClick={handleBack}>
                    Back to Meals Planner
                </button>
            </div>
        );
    }

    if (!journey || !weekStart) {
        return (
            <div className="meal-week-loading">
                <div className="meal-week-loader" />
                <span>Preparing your weekly meal planner...</span>
            </div>
        );
    }

    return (
        <MealWeek
            journey={journey}
            weekStart={weekStart}
            weekDates={weekDates}
            mealPlans={mealPlans.filter(
                (meal) => meal.journey_id === journeyId
            )}
            loading={loading}
            onBack={handleBack}
            onPreviousWeek={handlePreviousWeek}
            onNextWeek={handleNextWeek}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            onOpenDay={handleOpenDay}
        />
    );
}

export default MealWeekContainer;
