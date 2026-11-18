
import {
    Cake,
    Heart,
    Gift,
    Sparkles,
    CalendarDays,
    Pencil,
    Trash2,
    PartyPopper,
} from "lucide-react";

import "./SpecialDayTable.css";

const CATEGORY_CONFIG = {
    birthday: {
        label: "Birthday",
        icon: Cake,
        className: "birthday",
    },
    wedding_anniversary: {
        label: "Wedding Anniversary",
        icon: Heart,
        className: "wedding",
    },
    engagement_anniversary: {
        label: "Engagement Anniversary",
        icon: Heart,
        className: "engagement",
    },
    marriage_day: {
        label: "Marriage Day",
        icon: Heart,
        className: "marriage",
    },
    baby_birthday: {
        label: "Baby Birthday",
        icon: Cake,
        className: "baby",
    },
    graduation_day: {
        label: "Graduation Day",
        icon: Gift,
        className: "graduation",
    },
    job_anniversary: {
        label: "Job Anniversary",
        icon: Gift,
        className: "job",
    },
    housewarming_anniversary: {
        label: "Housewarming",
        icon: Gift,
        className: "housewarming",
    },
    religious_occasion: {
        label: "Religious Occasion",
        icon: Sparkles,
        className: "religious",
    },
    festival: {
        label: "Festival",
        icon: PartyPopper,
        className: "festival",
    },
    other: {
        label: "Other",
        icon: CalendarDays,
        className: "other",
    },
};

const formatEventDate = (dateString) => {
    if (!dateString) return "-";

    const [year, month, day] = dateString.split("-").map(Number);

    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

function SpecialDayTable({
    events = [],
    onEdit,
    onDelete,
}) {
    const today = new Date();

    const todayKey = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-");

    if (events.length === 0) {
        return (
            <div className="special-day-empty-state">
                <div className="special-day-empty-icon">
                    <CalendarDays size={32} />
                </div>

                <h3>No special days added yet</h3>

                <p>
                    Add birthdays, wedding anniversaries and other
                    important occasions for this month.
                </p>
            </div>
        );
    }

    return (
        <div className="special-day-table-wrapper">
            <table className="special-day-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Person / Occasion</th>
                        <th>Category</th>
                        <th>Remarks</th>
                        <th className="special-day-actions-heading">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {events.map((event) => {
                        const category =
                            CATEGORY_CONFIG[event.category] ||
                            CATEGORY_CONFIG.other;

                        const CategoryIcon = category.icon;

                        const [, month, day] = event.event_date
                            .split("-")
                            .map(Number);

                        const isToday =
                            month === today.getMonth() + 1 &&
                            day === today.getDate();

                        return (
                            <tr
                                key={event.id}
                                className={
                                    isToday
                                        ? "special-day-today-row"
                                        : ""
                                }
                            >
                                <td>
                                    <div className="special-day-date-cell">
                                        <CalendarDays size={16} />
                                        <strong>
                                            {formatEventDate(event.event_date)}
                                        </strong>

                                        {isToday && (
                                            <span className="special-day-today-badge">
                                                Today
                                            </span>
                                        )}
                                    </div>
                                </td>

                                <td>
                                    <div className="special-day-title-cell">
                                        {isToday && (
                                            <Sparkles
                                                size={16}
                                                className="special-day-title-sparkle"
                                            />
                                        )}

                                        <strong>{event.title}</strong>
                                    </div>
                                </td>

                                <td>
                                    <span
                                        className={`special-day-category-badge ${category.className}`}
                                    >
                                        <CategoryIcon size={14} />
                                        {category.label}
                                    </span>
                                </td>

                                <td>
                                    <span className="special-day-remarks">
                                        {event.remarks || "—"}
                                    </span>
                                </td>

                                <td>
                                    <div className="special-day-row-actions">
                                        <button
                                            type="button"
                                            className="special-day-edit-btn"
                                            onClick={() => onEdit(event)}
                                            title="Edit"
                                        >
                                            <Pencil size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            className="special-day-delete-btn"
                                            onClick={() => onDelete(event)}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default SpecialDayTable;
