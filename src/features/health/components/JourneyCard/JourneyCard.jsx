
import {
    CalendarDays,
    Scale,
    Target,
    Ruler,
    ArrowRight,
    Pencil,
    Trash2,
} from "lucide-react";

import "./JourneyCard.css";

const formatDate = (value) => {
    if (!value) return "—";

    return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatWeight = (value) =>
    `${Number(value || 0).toFixed(2).replace(/\.00$/, "")} kg`;

export default function JourneyCard({
    journey,
    onOpen,
    onEdit,
    onDelete,
    onStatusChange,
}) {
    const initialWeight = Number(journey.initial_weight || 0);
    const currentWeight = Number(journey.last_updated_weight || 0);
    const targetWeight = Number(journey.target_weight || 0);

    const weightChange = initialWeight - currentWeight;
    const totalToLose = initialWeight - targetWeight;

    const progress =
        totalToLose > 0
            ? Math.min(100, Math.max(0, (weightChange / totalToLose) * 100))
            : 0;

    const statusClass = journey.status || "pending";

    const currentWeightClass =
        currentWeight > targetWeight ? "current-warning" : "current-success";

    const handleAction = (event, callback) => {
        event.stopPropagation();
        callback?.(journey);
    };

    return (
        <article
            className="weightloss-journey-card"
            onClick={() => onOpen?.(journey)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen?.(journey);
                }
            }}
        >
            <div className="journey-card-top">
                <div className="journey-card-icon">
                    <Scale size={21} />
                </div>

                <div className="journey-card-actions">
                    <select
                        value={statusClass}
                        className={`journey-status-select ${statusClass}`}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => {
                            event.stopPropagation();
                            onStatusChange?.(journey, event.target.value);
                        }}
                        aria-label="Change journey status"
                    >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="dropped">Dropped</option>
                    </select>

                    <button
                        type="button"
                        className="journey-icon-action edit"
                        title="Edit journey"
                        onClick={(event) => handleAction(event, onEdit)}
                    >
                        <Pencil size={15} />
                    </button>

                    <button
                        type="button"
                        className="journey-icon-action delete"
                        title="Delete journey"
                        onClick={(event) => handleAction(event, onDelete)}
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            <div className="journey-card-heading">
                <h3>{journey.journey_name}</h3>
                <p>
                    <CalendarDays size={14} />
                    {formatDate(journey.from_date)} – {formatDate(journey.to_date)}
                </p>
            </div>

            <div className="journey-card-metrics">
                <div className="journey-metric initial-metric">
                    <span>Initial Weight</span>
                    <strong>{formatWeight(initialWeight)}</strong>
                </div>

                <div className="journey-metric target-metric">
                    <span>Target Weight</span>
                    <strong>{formatWeight(targetWeight)}</strong>
                </div>

                <div className={`journey-metric current-metric ${currentWeightClass}`}>
                    <span>Last Updated Weight</span>
                    <strong>{formatWeight(currentWeight)}</strong>
                </div>

                <div className="journey-metric height-metric">
                    <span>Height</span>
                    <strong>
                        <Ruler size={13} />
                        {Number(journey.height_cm || 0).toFixed(1)} cm
                    </strong>
                </div>
            </div>

            <div className="journey-progress-area">
                <div className="journey-progress-heading">
                    <span>Weight Goal Progress</span>
                    <strong>{progress.toFixed(0)}%</strong>
                </div>

                <div className="journey-progress-track">
                    <div
                        className="journey-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="journey-progress-caption">
                    {weightChange >= 0
                        ? `${weightChange.toFixed(2)} kg lost`
                        : `${Math.abs(weightChange).toFixed(2)} kg gained`}

                    <span>
                        <Target size={13} />
                        {formatWeight(targetWeight)} goal
                    </span>
                </div>
            </div>

            <div className="journey-card-footer">
                <span>View weight transactions</span>
                <ArrowRight size={17} />
            </div>
        </article>
    );
}
