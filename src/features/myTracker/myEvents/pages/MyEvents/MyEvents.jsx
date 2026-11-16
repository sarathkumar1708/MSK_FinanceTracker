
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, CalendarDays, Search } from "lucide-react";

import EventCard from "../../components/EventCard/EventCard";
import EventFormModal from "../../components/EventFormModal/EventFormModal";

import {
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    selectMyEvents,
    selectMyEventsLoading,
    selectMyEventsSaving,
    selectMyEventsError,
    clearMyEventsError,
} from "../../myEventsSlice";

import "./MyEvents.css";

const MyEvents = ({ onSelectEvent }) => {
    const dispatch = useDispatch();

    const events = useSelector(selectMyEvents);
    const loading = useSelector(selectMyEventsLoading);
    const saving = useSelector(selectMyEventsSaving);
    const error = useSelector(selectMyEventsError);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        dispatch(fetchEvents());
    }, [dispatch]);

    const openCreateModal = () => {
        setSelectedEvent(null);
        dispatch(clearMyEventsError());
        setModalOpen(true);
    };

    const openEditModal = (event) => {
        setSelectedEvent(event);
        dispatch(clearMyEventsError());
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;

        setModalOpen(false);
        setSelectedEvent(null);
        dispatch(clearMyEventsError());
    };

    const handleSubmit = async (formData) => {
        try {
            if (selectedEvent) {
                await dispatch(
                    updateEvent({
                        eventId: selectedEvent.id,
                        eventData: formData,
                    })
                ).unwrap();
            } else {
                await dispatch(createEvent(formData)).unwrap();
            }

            setModalOpen(false);
            setSelectedEvent(null);
        } catch (err) {
            // Redux stores the error and displays it in the popup.
        }
    };

    const handleDelete = async (event) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${event.event_title}"? All child events and their transactions will also be deleted.`
        );

        if (!confirmed) return;

        try {
            await dispatch(deleteEvent(event.id)).unwrap();
        } catch (err) {
            window.alert(
                typeof err === "string"
                    ? err
                    : "Unable to delete this event."
            );
        }
    };

    const filteredEvents = events.filter((event) =>
        event.event_title
            ?.toLowerCase()
            .includes(searchTerm.trim().toLowerCase())
    );

    return (
        <div className="my-events-page">
            <div className="my-events-header">
                <div className="my-events-heading">
                    <div className="my-events-heading-icon">
                        <CalendarDays size={25} />
                    </div>

                    <div>
                        <h1>My Events</h1>
                        <p>
                            Manage your celebrations, occasions and
                            event contributions.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="my-events-create-btn"
                    onClick={openCreateModal}
                >
                    <Plus size={19} />
                    Create Event
                </button>
            </div>

            <div className="my-events-toolbar">
                <div className="my-events-total">
                    <span>Total Events</span>
                    <strong>{events.length}</strong>
                </div>

                <div className="my-events-search">
                    <Search size={17} />
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="my-events-error">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="my-events-status">
                    Loading events...
                </div>
            ) : filteredEvents.length > 0 ? (
                <div className="my-events-grid">
                    {filteredEvents.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            onClick={onSelectEvent}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="my-events-empty">
                    <div className="my-events-empty-icon">
                        <CalendarDays size={34} />
                    </div>

                    <h3>
                        {searchTerm
                            ? "No matching events"
                            : "No events created yet"}
                    </h3>

                    <p>
                        {searchTerm
                            ? "Try searching with another event title."
                            : "Start by creating your first event, such as Birthday or Wedding."}
                    </p>

                    {!searchTerm && (
                        <button
                            type="button"
                            className="my-events-create-btn"
                            onClick={openCreateModal}
                        >
                            <Plus size={18} />
                            Create Your First Event
                        </button>
                    )}
                </div>
            )}

            <EventFormModal
                isOpen={modalOpen}
                event={selectedEvent}
                saving={saving}
                onClose={closeModal}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default MyEvents;
