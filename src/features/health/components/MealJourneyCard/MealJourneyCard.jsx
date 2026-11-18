
import {
    CalendarDays,
    Clock3,
    ChevronRight,
    Pencil,
    Trash2,
    Utensils,
} from "lucide-react";

import "./MealJourneyCard.css";

const statusLabels = {
    active: "Active",
    completed: "Completed",
    archived: "Archived",
};

function formatDate(dateString) {
    if (!dateString) return "-";

    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getDuration(fromDate, toDate) {
    if (!fromDate || !toDate) return 0;

    const start = new Date(`${fromDate}T00:00:00`);
    const end = new Date(`${toDate}T00:00:00`);

    return Math.max(
        1,
        Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
    );
}

function MealJourneyCard({
    journey,
    onClick,
    onEdit,
    onDelete,
}) {
    const status = journey.status || "active";
    const duration = getDuration(journey.from_date, journey.to_date);

    return (
        <article
            className="meal-journey-card"
            onClick={onClick}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onClick();
                }
            }}
            role="button"
            tabIndex={0}
        >
            <div className="meal-journey-card-top">
                <div className="meal-journey-card-icon">
                    <Utensils size={22} />
                </div>

                <span className={`meal-journey-status status-${status}`}>
                    {statusLabels[status] || status}
                </span>
            </div>

            <div className="meal-journey-card-content">
                <h3>{journey.journey_name}</h3>

                <p className="meal-journey-card-description">
                    {journey.notes?.trim() ||
                        "Your personal meal planning and nutrition journey."}
                </p>
            </div>

            <div className="meal-journey-date-panel">
                <div className="meal-journey-date-item">
                    <span>START DATE</span>
                    <strong>{formatDate(journey.from_date)}</strong>
                </div>

                <div className="meal-journey-date-divider" />

                <div className="meal-journey-date-item">
                    <span>END DATE</span>
                    <strong>{formatDate(journey.to_date)}</strong>
                </div>
            </div>

            <div className="meal-journey-card-bottom">
                <div className="meal-journey-duration">
                    <Clock3 size={15} />
                    <span>{duration} {duration === 1 ? "day" : "days"}</span>
                </div>

                <div className="meal-journey-card-actions">
                    <button
                        type="button"
                        className="meal-card-action edit"
                        title="Edit journey"
                        aria-label="Edit journey"
                        onClick={(event) => {
                            event.stopPropagation();
                            onEdit(journey);
                        }}
                    >
                        <Pencil size={15} />
                    </button>

                    <button
                        type="button"
                        className="meal-card-action delete"
                        title="Delete journey"
                        aria-label="Delete journey"
                        onClick={(event) => {
                            event.stopPropagation();
                            onDelete(journey);
                        }}
                    >
                        <Trash2 size={15} />
                    </button>

                    <span className="meal-card-open">
                        <ChevronRight size={19} />
                    </span>
                </div>
            </div>
        </article>
    );
}

export default MealJourneyCard;
