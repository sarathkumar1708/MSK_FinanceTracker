
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import DailyMealPlan from "./DailyMealPlan";

import {
    fetchMealJourneys,
    fetchMealPlans,
    createMealPlan,
    createFoodItem,
    updateFoodItem,
    deleteFoodItem,
    deleteMealPlan,
} from "../../store/mealPlannerSlice";

const MEAL_TYPES = ["Morning", "Afternoon", "Evening", "Night"];

const VALID_MEAL_TYPES = [
    "morning",
    "afternoon",
    "evening",
    "night",
];

// ============================================
// HELPERS
// ============================================

function normalizeMealType(value) {
    return String(value || "").trim().toLowerCase();
}

function normalizeMealTime(value) {
    return String(value || "").trim().slice(0, 5);
}

function formatDate(dateString) {
    if (!dateString) return "";

    return new Date(`${dateString}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
        }
    );
}

function getErrorMessage(error) {
    if (typeof error === "string" && error.trim()) {
        return error;
    }

    return (
        error?.payload ||
        error?.message ||
        error?.details ||
        "Something went wrong. Please try again."
    );
}

// ============================================
// DAILY MEAL PLAN CONTAINER
// ============================================

export default function DailyMealPlanContainer() {
    const { journeyId, date } = useParams();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        journeys = [],
        mealPlans = [],
        loading,
        saving,
        error,
    } = useSelector((state) => state.mealPlanner || {});

    const [modalOpen, setModalOpen] = useState(false);
    const [editingFood, setEditingFood] = useState(null);
    const [actionError, setActionError] = useState("");

    // ============================================
    // CURRENT JOURNEY
    // ============================================

    const journey = useMemo(
        () => journeys.find((item) => item.id === journeyId),
        [journeys, journeyId]
    );

    // ============================================
    // FETCH JOURNEYS
    // ============================================

    useEffect(() => {
        if (!journeys.length) {
            dispatch(fetchMealJourneys());
        }
    }, [dispatch, journeys.length]);

    // ============================================
    // FETCH DAILY MEALS
    // ============================================

    useEffect(() => {
        if (!journeyId || !date) return;

        dispatch(
            fetchMealPlans({
                journeyId,
                startDate: date,
                endDate: date,
            })
        );
    }, [dispatch, journeyId, date]);

    // ============================================
    // FILTER DAILY MEALS
    // ============================================

    const dailyMeals = useMemo(() => {
        return mealPlans
            .filter(
                (meal) =>
                    meal.journey_id === journeyId &&
                    meal.meal_date === date
            )
            .sort((a, b) =>
                (a.meal_time || "").localeCompare(b.meal_time || "")
            );
    }, [mealPlans, journeyId, date]);

    // ============================================
    // DAILY NUTRITION TOTALS
    // ============================================

    const totals = useMemo(() => {
        return dailyMeals.reduce(
            (total, meal) => {
                (meal.food_items || []).forEach((food) => {
                    total.calories += Number(food.calories) || 0;
                    total.protein += Number(food.protein_g) || 0;
                    total.carbs += Number(food.carbs_g) || 0;
                    total.fat += Number(food.fat_g) || 0;
                    total.foodCount += 1;
                });

                return total;
            },
            {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                foodCount: 0,
            }
        );
    }, [dailyMeals]);

    // ============================================
    // OPEN ADD MODAL
    // ============================================

    const openAddModal = useCallback(() => {
        setActionError("");
        setEditingFood(null);
        setModalOpen(true);
    }, []);

    // ============================================
    // OPEN EDIT FOOD MODAL
    // ============================================

    const openEditModal = useCallback((food, meal) => {
        setActionError("");

        setEditingFood({
            ...food,
            meal,
        });

        setModalOpen(true);
    }, []);

    // ============================================
    // CLOSE MODAL
    // ============================================

    const closeModal = useCallback(() => {
        if (saving) return;

        setModalOpen(false);
        setEditingFood(null);
        setActionError("");
    }, [saving]);

    // ============================================
    // SAVE MEAL / FOOD ITEMS
    // ============================================

    const handleSave = async (values) => {
        setActionError("");

        let createdMealId = null;
        const insertedFoodIds = [];

        try {
            // ------------------------------------
            // EDIT EXISTING FOOD ITEM
            // ------------------------------------

            if (editingFood) {
                const food = values.foodItems?.[0];

                if (!food) {
                    throw new Error("Please enter the food details.");
                }

                await dispatch(
                    updateFoodItem({
                        id: editingFood.id,
                        ...food,
                    })
                ).unwrap();

                setModalOpen(false);
                setEditingFood(null);
                setActionError("");

                return;
            }

            // ------------------------------------
            // VALIDATE FOOD ITEMS
            // ------------------------------------

            if (!values.foodItems?.length) {
                throw new Error("Please add at least one food item.");
            }

            // ------------------------------------
            // NORMALIZE MEAL DETAILS
            // ------------------------------------

            const mealType = normalizeMealType(values.meal_type);
            const mealTime = normalizeMealTime(values.meal_time);

            if (!VALID_MEAL_TYPES.includes(mealType)) {
                throw new Error("Please select a valid meal category.");
            }

            if (!mealTime) {
                throw new Error("Please select a meal time.");
            }

            // ------------------------------------
            // FIND EXISTING MEAL
            //
            // Same journey + date + meal type
            // + meal time = same parent meal card.
            // ------------------------------------

            const existingMeal = dailyMeals.find((meal) => {
                return (
                    meal.journey_id === journeyId &&
                    meal.meal_date === date &&
                    normalizeMealType(meal.meal_type) === mealType &&
                    normalizeMealTime(meal.meal_time) === mealTime
                );
            });

            let mealId;

            // ------------------------------------
            // REUSE EXISTING MEAL
            // ------------------------------------

            if (existingMeal) {
                mealId = existingMeal.id;
            } else {
                // Create a parent meal only if no
                // matching meal already exists.

                const meal = await dispatch(
                    createMealPlan({
                        journey_id: journeyId,
                        meal_date: date,
                        meal_type: mealType,
                        meal_time: mealTime,
                        notes: values.notes || null,
                    })
                ).unwrap();

                mealId = meal.id;
                createdMealId = meal.id;
            }

            // ------------------------------------
            // INSERT FOOD ITEMS
            // All foods use the same meal_plan_id.
            // ------------------------------------

            for (const food of values.foodItems) {
                const savedFood = await dispatch(
                    createFoodItem({
                        meal_plan_id: mealId,
                        ...food,
                    })
                ).unwrap();

                insertedFoodIds.push(savedFood.id);
            }

            // ------------------------------------
            // SUCCESS
            // ------------------------------------

            setModalOpen(false);
            setEditingFood(null);
            setActionError("");

        } catch (error) {
            const originalError = getErrorMessage(error);

            // ------------------------------------
            // ROLLBACK IF SAVE FAILED
            // ------------------------------------

            if (createdMealId) {
                // Newly created meal:
                // deleting the parent should also
                // delete its food rows via cascade.

                try {
                    await dispatch(
                        deleteMealPlan(createdMealId)
                    ).unwrap();
                } catch (cleanupError) {
                    console.error(
                        "Meal cleanup failed:",
                        cleanupError
                    );
                }
            } else {
                // Existing meal:
                // remove only food rows inserted
                // during this unsuccessful attempt.

                for (const foodId of insertedFoodIds) {
                    try {
                        await dispatch(
                            deleteFoodItem(foodId)
                        ).unwrap();
                    } catch (cleanupError) {
                        console.error(
                            "Food cleanup failed:",
                            cleanupError
                        );
                    }
                }
            }

            setActionError(originalError);

            // Keep the modal open so the user
            // can correct the data and try again.
            throw error;
        }
    };

    // ============================================
    // DELETE FOOD ITEM
    // ============================================

    const handleDeleteFood = async (food, meal) => {
        const foodCount = meal?.food_items?.length || 0;

        if (!foodCount) return;

        const confirmMessage =
            foodCount === 1
                ? "This is the last food item in this meal. Deleting it will also remove the entire meal card. Continue?"
                : `Are you sure you want to delete ${food.food_name}?`;

        if (!window.confirm(confirmMessage)) return;

        try {
            setActionError("");

            if (foodCount === 1) {
                // Delete the last food first.
                await dispatch(
                    deleteFoodItem(food.id)
                ).unwrap();

                // Then remove the now-empty parent meal.
                await dispatch(
                    deleteMealPlan(meal.id)
                ).unwrap();
            } else {
                await dispatch(
                    deleteFoodItem(food.id)
                ).unwrap();
            }

        } catch (error) {
            setActionError(getErrorMessage(error));
        }
    };

    // ============================================
    // NAVIGATION
    // ============================================

    const handleBack = () => {
        navigate(`/health/meals-planner/${journeyId}`);
    };

    // ============================================
    // JOURNEY VALIDATION
    // ============================================

    if (
        !journey &&
        !loading &&
        journeys.length > 0
    ) {
        return (
            <div className="daily-meal-error">
                <h2>Journey not found</h2>

                <p>
                    This meal-planning journey may have been deleted.
                </p>

                <button
                    type="button"
                    onClick={() => navigate("/health/meals-planner")}
                >
                    Back to Meals Planner
                </button>
            </div>
        );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
        return (
            <div className="daily-meal-error">
                <h2>Invalid date</h2>

                <button
                    type="button"
                    onClick={handleBack}
                >
                    Back to Weekly Planner
                </button>
            </div>
        );
    }

    // ============================================
    // RENDER
    // ============================================

    return (
        <DailyMealPlan
            journey={journey}
            date={date}
            formattedDate={formatDate(date)}
            meals={dailyMeals}
            totals={totals}
            loading={loading}
            saving={saving}
            error={actionError || error}
            modalOpen={modalOpen}
            editingFood={editingFood}
            mealTypes={MEAL_TYPES}
            onBack={handleBack}
            onAddMeal={openAddModal}
            onEditFood={openEditModal}
            onDeleteFood={handleDeleteFood}
            onCloseModal={closeModal}
            onSave={handleSave}
        />
    );
}
