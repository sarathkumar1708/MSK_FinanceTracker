
import {
    CalendarDays,
    Flame,
    Beef,
    Wheat,
    Droplets,
    ChevronRight,
} from "lucide-react";

import "./WeekDayCard.css";

function formatDate(date) {
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
    });
}

function WeekDayCard({
    date,
    meals = [],
    onClick,
    disabled = false,
}) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = date.getTime() === today.getTime();

    const totals = meals.reduce(
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

    const mealCount = meals.length;

    return (
        <button
            type="button"
            className={[
                "week-day-card",
                isToday ? "week-day-today" : "",
                disabled ? "week-day-disabled" : "",
            ].join(" ")}
            onClick={onClick}
            disabled={disabled}
        >
            <div className="week-day-card-header">
                <div className="week-day-icon">
                    <CalendarDays size={19} />
                </div>

                {isToday && (
                    <span className="week-day-today-badge">Today</span>
                )}
            </div>

            <div className="week-day-title">
                <h3>
                    {date.toLocaleDateString("en-IN", {
                        weekday: "long",
                    })}
                </h3>
                <span>{formatDate(date)}</span>
            </div>

            <div className="week-day-calories">
                <div>
                    <Flame size={17} />
                    <span>Daily Calories</span>
                </div>

                <strong>
                    {Math.round(totals.calories).toLocaleString("en-IN")}
                    <small> kcal</small>
                </strong>
            </div>

            <div className="week-day-nutrition">
                <div className="week-nutrition-item protein">
                    <Beef size={14} />
                    <span>{totals.protein.toFixed(1)}g</span>
                </div>

                <div className="week-nutrition-item carbs">
                    <Wheat size={14} />
                    <span>{totals.carbs.toFixed(1)}g</span>
                </div>

                <div className="week-nutrition-item fat">
                    <Droplets size={14} />
                    <span>{totals.fat.toFixed(1)}g</span>
                </div>
            </div>

            <div className="week-day-card-footer">
                <span>
                    {mealCount} {mealCount === 1 ? "meal" : "meals"} planned
                </span>

                <ChevronRight size={17} />
            </div>
        </button>
    );
}

export default WeekDayCard;
