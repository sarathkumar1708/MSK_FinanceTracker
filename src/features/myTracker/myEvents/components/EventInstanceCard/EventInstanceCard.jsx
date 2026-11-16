
import React from "react";
import {
    CalendarHeart,
    ChevronRight,
    Pencil,
    Trash2,
} from "lucide-react";
import "./EventInstanceCard.css";

const EventInstanceCard = ({
    instance,
    onClick,
    onEdit,
    onDelete,
}) => {
    const formattedDate = instance.event_date
        ? new Date(`${instance.event_date}T00:00:00`).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        )
        : "Date not specified";

    return (
        <div className="my-event-instance-card">
            <div
                className="my-event-instance-main"
                role="button"
                tabIndex={0}
                onClick={() => onClick?.(instance)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") onClick?.(instance);
                }}
            >
                <div className="my-event-instance-top">
                    <div className="my-event-instance-icon">
                        <CalendarHeart size={24} />
                    </div>

                    <span className="my-event-instance-count">
                        {instance.transaction_count || 0}
                    </span>
                </div>

                <h3>{instance.event_title}</h3>

                {instance.celebrated_person && (
                    <p className="my-event-instance-person">
                        {instance.celebrated_person}
                    </p>
                )}

                <p className="my-event-instance-date">
                    {formattedDate}
                </p>

                <div className="my-event-instance-footer">
                    <span>View Details</span>
                    <ChevronRight size={17} />
                </div>
            </div>

            <div className="my-event-instance-actions">
                <button
                    type="button"
                    title="Edit event"
                    onClick={() => onEdit?.(instance)}
                >
                    <Pencil size={15} />
                </button>

                <button
                    type="button"
                    title="Delete event"
                    className="delete"
                    onClick={() => onDelete?.(instance)}
                >
                    <Trash2 size={15} />
                </button>
            </div>
        </div>
    );
};

export default EventInstanceCard;
