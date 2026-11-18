
import {
    ArrowLeft,
    CalendarDays,
    Plus,
    Flame,
    Beef,
    Wheat,
    Droplets,
    Clock3,
    Pencil,
    Trash2,
    Utensils,
    Sunrise,
    Sun,
    Sunset,
    Moon,
    ClipboardList,
} from "lucide-react";

import PlanMealModal from "../../components/PlanMealModal/PlanMealModal";
import "./DailyMealPlan.css";

const MEAL_CONFIG = {
    Morning: {
        icon: Sunrise,
        description: "Start your day with a nourishing breakfast",
        className: "morning",
    },
    Afternoon: {
        icon: Sun,
        description: "Your midday meal",
        className: "afternoon",
    },
    Evening: {
        icon: Sunset,
        description: "A light evening meal or snack",
        className: "evening",
    },
    Night: {
        icon: Moon,
        description: "Finish your day with a balanced dinner",
        className: "night",
    },
};

const formatNumber = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 1,
    });

const getMealTypeLabel = (value) => {
    const normalized = String(value || "").trim().toLowerCase();

    const labels = {
        morning: "Morning",
        afternoon: "Afternoon",
        evening: "Evening",
        night: "Night",
    };

    return labels[normalized] || null;
};

const normalizeTime = (value) => {
    if (!value) return "Time not specified";

    return String(value).slice(0, 5);
};

// Group records having the same meal type and time.
function groupMealsByTypeAndTime(meals, mealTypes) {
    const grouped = new Map();

    meals.forEach((meal) => {
        const type = getMealTypeLabel(meal.meal_type);

        if (!type) return;

        const time = normalizeTime(meal.meal_time);
        const key = `${type}-${time}`;

        if (!grouped.has(key)) {
            grouped.set(key, {
                id: key,
                meal_type: type.toLowerCase(),
                meal_time: time,
                food_items: [],
                notes: meal.notes || "",
                sourceMealIds: [],
            });
        }

        const group = grouped.get(key);

        group.sourceMealIds.push(meal.id);

        (meal.food_items || []).forEach((food) => {
            group.food_items.push(food);
        });

        if (meal.notes && !group.notes) {
            group.notes = meal.notes;
        }
    });

    const result = {};

    mealTypes.forEach((mealType) => {
        const label = getMealTypeLabel(mealType) || mealType;

        result[label] = Array.from(grouped.values())
            .filter((meal) => getMealTypeLabel(meal.meal_type) === label)
            .sort((a, b) =>
                a.meal_time.localeCompare(b.meal_time)
            );
    });

    return result;
}

function NutritionCard({ icon: Icon, label, value, unit, className }) {
    return (
        <div className={`daily-nutrition-card ${className}`}>
            <div className="daily-nutrition-icon">
                <Icon size={20} />
            </div>

            <div>
                <span>{label}</span>
                <strong>
                    {formatNumber(value)}
                    <small> {unit}</small>
                </strong>
            </div>
        </div>
    );
}

function FoodTable({ foods = [], meal, onEdit, onDelete }) {
    if (!foods.length) {
        return (
            <div className="daily-meal-empty-food">
                <Utensils size={18} />
                <span>No food items added to this meal yet.</span>
            </div>
        );
    }

    return (
        <div className="daily-food-table-wrapper">
            <table className="daily-food-table">
                <thead>
                    <tr>
                        <th>Food Item</th>
                        <th>Quantity</th>
                        <th>Calories</th>
                        <th>Protein</th>
                        <th>Carbs</th>
                        <th>Fat</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {foods.map((food) => (
                        <tr key={food.id}>
                            <td>
                                <div className="daily-food-name">
                                    <strong>{food.food_name}</strong>

                                    {food.notes && (
                                        <small>{food.notes}</small>
                                    )}
                                </div>
                            </td>

                            <td>
                                {food.quantity} {food.quantity_unit}
                            </td>

                            <td className="daily-food-calories">
                                {formatNumber(food.calories)} kcal
                            </td>

                            <td>{formatNumber(food.protein_g)} g</td>
                            <td>{formatNumber(food.carbs_g)} g</td>
                            <td>{formatNumber(food.fat_g)} g</td>

                            <td>
                                <div className="daily-food-actions">
                                    <button
                                        type="button"
                                        title="Edit food item"
                                        onClick={() => onEdit(food, meal)}
                                    >
                                        <Pencil size={16} />
                                    </button>

                                    <button
                                        type="button"
                                        title="Delete food item"
                                        className="delete"
                                        onClick={() => onDelete(food, meal)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function DailyMealPlan({
    journey,
    date,
    formattedDate,
    meals = [],
    totals,
    loading,
    saving,
    error,
    modalOpen,
    editingFood,
    mealTypes = ["Morning", "Afternoon", "Evening", "Night"],
    onBack,
    onAddMeal,
    onEditFood,
    onDeleteFood,
    onCloseModal,
    onSave,
}) {
    const groupedMeals = groupMealsByTypeAndTime(meals, mealTypes);

    return (
        <div className="daily-meal-page">
            <div className="daily-meal-topbar">
                <button
                    type="button"
                    className="daily-meal-back"
                    onClick={onBack}
                >
                    <ArrowLeft size={18} />
                    Weekly Planner
                </button>

                <div className="daily-meal-date-label">
                    <CalendarDays size={17} />
                    {formattedDate}
                </div>
            </div>

            <section className="daily-meal-hero">
                <div className="daily-meal-hero-content">
                    <span className="daily-meal-eyebrow">
                        DAILY NUTRITION TRACKER
                    </span>

                    <h1>Your Daily Meal Plan</h1>

                    <p>
                        {journey?.journey_name || "Meal Planning Journey"}
                        {" · "}
                        Track your meals, calories and nutrition throughout
                        the day.
                    </p>
                </div>

                <div className="daily-meal-hero-icon">
                    <Utensils size={42} />
                </div>
            </section>

            <section className="daily-calorie-summary">
                <div className="daily-calorie-main">
                    <div className="daily-calorie-icon">
                        <Flame size={25} />
                    </div>

                    <div>
                        <span>Total Calories Consumed</span>

                        <h2>
                            {formatNumber(totals?.calories)}
                            <small> kcal</small>
                        </h2>

                        <p>
                            {totals?.foodCount || 0} food items recorded today
                        </p>
                    </div>
                </div>

                <div className="daily-calorie-side">
                    <span>Meal groups</span>
                    <strong>
                        {Object.values(groupedMeals).reduce(
                            (sum, items) => sum + items.length,
                            0
                        )}
                    </strong>
                </div>
            </section>

            <section className="daily-nutrition-grid">
                <NutritionCard
                    icon={Beef}
                    label="Protein"
                    value={totals?.protein}
                    unit="g"
                    className="protein"
                />

                <NutritionCard
                    icon={Wheat}
                    label="Carbohydrates"
                    value={totals?.carbs}
                    unit="g"
                    className="carbs"
                />

                <NutritionCard
                    icon={Droplets}
                    label="Fat"
                    value={totals?.fat}
                    unit="g"
                    className="fat"
                />

                <NutritionCard
                    icon={ClipboardList}
                    label="Food Items"
                    value={totals?.foodCount}
                    unit="items"
                    className="items"
                />
            </section>

            <div className="daily-meal-section-heading">
                <div>
                    <h2>Today's Meals</h2>
                    <p>Manage your food intake by meal and time.</p>
                </div>

                <button
                    type="button"
                    className="daily-plan-button"
                    onClick={onAddMeal}
                    disabled={saving}
                >
                    <Plus size={18} />
                    Plan Your Meal
                </button>
            </div>

            {error && (
                <div className="daily-meal-error-message">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="daily-meal-loading">
                    Loading your daily meals...
                </div>
            ) : (
                <div className="daily-meal-sections">
                    {mealTypes.map((mealType) => {
                        const type = getMealTypeLabel(mealType) || mealType;
                        const config = MEAL_CONFIG[type];

                        if (!config) return null;

                        const Icon = config.icon;
                        const typeMeals = groupedMeals[type] || [];

                        const totalFoodCount = typeMeals.reduce(
                            (sum, meal) => sum + meal.food_items.length,
                            0
                        );

                        return (
                            <section
                                key={type}
                                className={`daily-meal-section ${config.className}`}
                            >
                                <div className="daily-meal-section-header">
                                    <div className="daily-meal-section-title">
                                        <div className="daily-meal-type-icon">
                                            <Icon size={21} />
                                        </div>

                                        <div>
                                            <h3>{type}</h3>
                                            <p>{config.description}</p>
                                        </div>
                                    </div>

                                    <span className="daily-meal-count">
                                        {totalFoodCount}{" "}
                                        {totalFoodCount === 1
                                            ? "food item"
                                            : "food items"}
                                    </span>
                                </div>

                                {typeMeals.length === 0 ? (
                                    <div className="daily-meal-empty">
                                        <Clock3 size={20} />
                                        <span>
                                            No {type.toLowerCase()} meal
                                            recorded.
                                        </span>
                                    </div>
                                ) : (
                                    typeMeals.map((meal) => {
                                        const mealCalories =
                                            meal.food_items.reduce(
                                                (sum, food) =>
                                                    sum +
                                                    (Number(food.calories) || 0),
                                                0
                                            );

                                        return (
                                            <div
                                                className="daily-meal-card"
                                                key={meal.id}
                                            >
                                                <div className="daily-meal-card-heading">
                                                    <div>
                                                        <h4>{type} Meal</h4>

                                                        <span>
                                                            <Clock3 size={14} />
                                                            {meal.meal_time}
                                                        </span>
                                                    </div>

                                                    <div className="daily-meal-card-total">
                                                        <strong>
                                                            {formatNumber(
                                                                mealCalories
                                                            )}
                                                        </strong>
                                                        <small>kcal</small>
                                                    </div>
                                                </div>

                                                <FoodTable
                                                    foods={meal.food_items}
                                                    meal={meal}
                                                    onEdit={onEditFood}
                                                    onDelete={onDeleteFood}
                                                />

                                                {meal.notes && (
                                                    <p className="daily-meal-notes">
                                                        <strong>
                                                            Meal notes:
                                                        </strong>{" "}
                                                        {meal.notes}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </section>
                        );
                    })}
                </div>
            )}

            <PlanMealModal
                open={modalOpen}
                saving={saving}
                editingFood={editingFood}
                mealTypes={mealTypes}
                onClose={onCloseModal}
                onSave={onSave}
            />
        </div>
    );
}
