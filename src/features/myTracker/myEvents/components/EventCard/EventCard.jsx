
import React from "react";
import {
    CalendarDays,
    ChevronRight,
    Pencil,
    Trash2,
} from "lucide-react";
import "./EventCard.css";

const EventCard = ({
    event,
    onClick,
    onEdit,
    onDelete,
}) => {
    return (
        <div className="my-event-card">
            <div
                className="my-event-card-main"
                onClick={() => onClick?.(event)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter") onClick?.(event);
                }}
            >
                <div className="my-event-card-top">
                    <div className="my-event-card-icon">
                        <CalendarDays size={25} />
                    </div>

                    <span className="my-event-count">
                        {event.instance_count || 0}
                    </span>
                </div>

                <div className="my-event-card-info">
                    <h3>{event.event_title}</h3>
                    <p>
                        {event.instance_count || 0}{" "}
                        {event.instance_count === 1 ? "event" : "events"}
                    </p>
                </div>

                <div className="my-event-card-footer">
                    <span>View Events</span>
                    <ChevronRight size={17} />
                </div>
            </div>

            <div className="my-event-card-actions">
                <button
                    type="button"
                    title="Edit event"
                    onClick={() => onEdit?.(event)}
                >
                    <Pencil size={15} />
                </button>

                <button
                    type="button"
                    title="Delete event"
                    className="delete"
                    onClick={() => onDelete?.(event)}
                >
                    <Trash2 size={15} />
                </button>
            </div>
        </div>
    );
};

export default EventCard;
