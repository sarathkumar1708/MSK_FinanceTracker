
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    Flame,
    Beef,
    Wheat,
    Droplets,
    Utensils,
} from "lucide-react";

import WeekDayCard from "../../components/WeekDayCard/WeekDayCard";

import "./MealWeek.css";

function formatDate(date) {
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function MealWeek({
    journey,
    weekStart,
    weekDates,
    mealPlans,
    loading,
    onBack,
    onPreviousWeek,
    onNextWeek,
    canGoPrevious,
    canGoNext,
    onOpenDay,
}) {
    const weekEnd = weekDates[6];

    const weekTotals = mealPlans.reduce(
        (result, meal) => {
            (meal.food_items || []).forEach((food) => {
                result.calories += Number(food.calories || 0);
                result.protein += Number(food.protein_g || 0);
                result.carbs += Number(food.carbs_g || 0);
                result.fat += Number(food.fat_g || 0);
            });

            return result;
        },
        {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
        }
    );

    const totalMeals = mealPlans.length;

    const mealsByDate = mealPlans.reduce((result, meal) => {
        if (!result[meal.meal_date]) {
            result[meal.meal_date] = [];
        }

        result[meal.meal_date].push(meal);
        return result;
    }, {});

    if (!journey || !weekStart) return null;

    return (
        <div className="meal-week-page">
            {/* TOP NAVIGATION */}
            <div className="meal-week-topbar">
                <button
                    type="button"
                    className="meal-week-back-btn"
                    onClick={onBack}
                >
                    <ArrowLeft size={17} />
                    <span>All Meal Journeys</span>
                </button>

                <span className="meal-week-journey-label">
                    <Utensils size={15} />
                    {journey.journey_name}
                </span>
            </div>

            {/* HEADER */}
            <div className="meal-week-header">
                <div className="meal-week-heading">
                    <div className="meal-week-heading-icon">
                        <CalendarDays size={24} />
                    </div>

                    <div>
                        <h1>Weekly Meal Planner</h1>
                        <p>
                            Plan your meals and monitor your daily nutrition.
                        </p>
                    </div>
                </div>
            </div>

            {/* JOURNEY INFORMATION */}
            <section className="meal-week-journey-banner">
                <div>
                    <span className="meal-week-eyebrow">YOUR HEALTH JOURNEY</span>
                    <h2>{journey.journey_name}</h2>
                    <p>
                        {formatDate(new Date(`${journey.from_date}T00:00:00`))}
                        {" — "}
                        {formatDate(new Date(`${journey.to_date}T00:00:00`))}
                    </p>
                </div>

                <div className="meal-week-banner-icon">
                    <Utensils size={38} />
                </div>
            </section>

            {/* WEEK SELECTOR */}
            <section className="meal-week-selector">
                <div className="meal-week-selector-title">
                    <span>SELECTED WEEK</span>
                    <h2>
                        {formatDate(weekStart)}
                        {" — "}
                        {formatDate(weekEnd)}
                    </h2>
                </div>

                <div className="meal-week-navigation">
                    <button
                        type="button"
                        onClick={onPreviousWeek}
                        disabled={!canGoPrevious}
                        aria-label="Previous week"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <span>Week View</span>

                    <button
                        type="button"
                        onClick={onNextWeek}
                        disabled={!canGoNext}
                        aria-label="Next week"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </section>

            {/* WEEK SUMMARY */}
            <section className="meal-week-summary">
                <div className="meal-week-summary-card calories">
                    <div className="meal-week-summary-icon">
                        <Flame size={21} />
                    </div>
                    <div>
                        <span>Weekly Calories</span>
                        <strong>
                            {Math.round(weekTotals.calories).toLocaleString("en-IN")}
                        </strong>
                        <small>kcal</small>
                    </div>
                </div>

                <div className="meal-week-summary-card protein">
                    <div className="meal-week-summary-icon">
                        <Beef size={21} />
                    </div>
                    <div>
                        <span>Protein</span>
                        <strong>{weekTotals.protein.toFixed(1)}</strong>
                        <small>grams</small>
                    </div>
                </div>

                <div className="meal-week-summary-card carbs">
                    <div className="meal-week-summary-icon">
                        <Wheat size={21} />
                    </div>
                    <div>
                        <span>Carbohydrates</span>
                        <strong>{weekTotals.carbs.toFixed(1)}</strong>
                        <small>grams</small>
                    </div>
                </div>

                <div className="meal-week-summary-card fat">
                    <div className="meal-week-summary-icon">
                        <Droplets size={21} />
                    </div>
                    <div>
                        <span>Fat</span>
                        <strong>{weekTotals.fat.toFixed(1)}</strong>
                        <small>grams</small>
                    </div>
                </div>
            </section>

            {/* DAILY CARDS */}
            <section className="meal-week-days-section">
                <div className="meal-week-section-heading">
                    <div>
                        <h2>Your Weekly Schedule</h2>
                        <p>
                            Select a day to view and manage its meals.
                        </p>
                    </div>

                    <span className="meal-week-meal-count">
                        {totalMeals} {totalMeals === 1 ? "meal" : "meals"} planned
                    </span>
                </div>

                {loading ? (
                    <div className="meal-week-loading">
                        <div className="meal-week-loader" />
                        <span>Loading weekly nutrition...</span>
                    </div>
                ) : (
                    <div className="meal-week-days-grid">
                        {weekDates.map((date) => {
                            const dateString = [
                                date.getFullYear(),
                                String(date.getMonth() + 1).padStart(2, "0"),
                                String(date.getDate()).padStart(2, "0"),
                            ].join("-");

                            const isWithinJourney =
                                dateString >= journey.from_date &&
                                dateString <= journey.to_date;

                            return (
                                <WeekDayCard
                                    key={dateString}
                                    date={date}
                                    meals={mealsByDate[dateString] || []}
                                    disabled={!isWithinJourney}
                                    onClick={() => onOpenDay(dateString)}
                                />
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

export default MealWeek;
