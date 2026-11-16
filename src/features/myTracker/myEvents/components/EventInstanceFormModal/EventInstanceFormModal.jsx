
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import "./EventInstanceFormModal.css";

const getToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const EventInstanceFormModal = ({
    isOpen,
    event,
    instance,
    saving,
    onClose,
    onSubmit,
}) => {
    const [form, setForm] = useState({
        event_title: "",
        celebrated_person: "",
        event_date: getToday(),
        remarks: "",
    });

    useEffect(() => {
        if (isOpen) {
            setForm({
                event_title: instance?.event_title || "",
                celebrated_person: instance?.celebrated_person || "",
                event_date: instance?.event_date || getToday(),
                remarks: instance?.remarks || "",
            });
        }
    }, [isOpen, instance]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.event_title.trim()) return;

        onSubmit({
            event_id: event.id,
            event_title: form.event_title.trim(),
            celebrated_person: form.celebrated_person.trim(),
            event_date: form.event_date || null,
            remarks: form.remarks.trim(),
        });
    };

    return (
        <div
            className="my-event-instance-modal-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !saving) {
                    onClose();
                }
            }}
        >
            <div
                className="my-event-instance-modal"
                role="dialog"
                aria-modal="true"
            >
                <div className="my-event-instance-modal-header">
                    <div>
                        <h2>
                            {instance ? "Edit Event" : "Create Event"}
                        </h2>
                        <p>
                            Under {event?.event_title}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="my-event-instance-modal-body">
                        <div className="my-event-instance-form-group">
                            <label>
                                Event Title <span>*</span>
                            </label>
                            <input
                                name="event_title"
                                value={form.event_title}
                                onChange={handleChange}
                                placeholder="Example: Selva Birthday 2025"
                                maxLength={120}
                                required
                            />
                        </div>

                        <div className="my-event-instance-form-group">
                            <label>Celebrated Person</label>
                            <input
                                name="celebrated_person"
                                value={form.celebrated_person}
                                onChange={handleChange}
                                placeholder="Example: Selva"
                                maxLength={100}
                            />
                        </div>

                        <div className="my-event-instance-form-group">
                            <label>Event Date</label>
                            <input
                                type="date"
                                name="event_date"
                                value={form.event_date}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="my-event-instance-form-group">
                            <label>Remarks</label>
                            <textarea
                                name="remarks"
                                value={form.remarks}
                                onChange={handleChange}
                                placeholder="Optional notes..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="my-event-instance-modal-footer">
                        <button
                            type="button"
                            className="my-event-instance-cancel"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="my-event-instance-save"
                            disabled={saving || !form.event_title.trim()}
                        >
                            {saving
                                ? "Saving..."
                                : instance
                                    ? "Update Event"
                                    : "Create Event"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventInstanceFormModal;
