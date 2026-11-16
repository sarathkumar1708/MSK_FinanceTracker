
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import "./EventFormModal.css";

const EventFormModal = ({
    isOpen,
    event,
    saving,
    onClose,
    onSubmit,
}) => {
    const [eventTitle, setEventTitle] = useState("");

    useEffect(() => {
        if (isOpen) {
            setEventTitle(event?.event_title || "");
        }
    }, [isOpen, event]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        const title = eventTitle.trim();

        if (!title) return;

        onSubmit({
            event_title: title,
        });
    };

    return (
        <div
            className="my-event-modal-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !saving) {
                    onClose();
                }
            }}
        >
            <div
                className="my-event-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="my-event-modal-title"
            >
                <div className="my-event-modal-header">
                    <div>
                        <h2 id="my-event-modal-title">
                            {event ? "Edit Event" : "Create Event"}
                        </h2>
                        <p>
                            {event
                                ? "Update your event title."
                                : "Create a new celebration category."}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="my-event-modal-close"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="my-event-modal-body">
                        <label htmlFor="event-title">
                            Event Title <span>*</span>
                        </label>

                        <input
                            id="event-title"
                            type="text"
                            value={eventTitle}
                            onChange={(e) => setEventTitle(e.target.value)}
                            placeholder="Example: Birthday"
                            maxLength={100}
                            autoFocus
                            required
                        />
                    </div>

                    <div className="my-event-modal-footer">
                        <button
                            type="button"
                            className="my-event-btn-cancel"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="my-event-btn-save"
                            disabled={saving || !eventTitle.trim()}
                        >
                            {saving
                                ? "Saving..."
                                : event
                                    ? "Update Event"
                                    : "Create Event"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventFormModal;
