
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    ArrowLeft,
    Plus,
    CalendarDays,
    Search,
} from "lucide-react";

import EventInstanceCard from "../../components/EventInstanceCard/EventInstanceCard";
import EventInstanceFormModal from "../../components/EventInstanceFormModal/EventInstanceFormModal";

import {
    fetchEventInstances,
    createEventInstance,
    updateEventInstance,
    deleteEventInstance,
    selectMyEventInstances,
    selectMyEventsLoading,
    selectMyEventsSaving,
    selectMyEventsError,
    clearMyEventsError,
} from "../../myEventsSlice";

import "./EventInstances.css";

const EventInstances = ({
    event,
    onBack,
    onSelectInstance,
}) => {
    const dispatch = useDispatch();

    const instances = useSelector(selectMyEventInstances);
    const loading = useSelector(selectMyEventsLoading);
    const saving = useSelector(selectMyEventsSaving);
    const error = useSelector(selectMyEventsError);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedInstance, setSelectedInstance] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (event?.id) {
            dispatch(fetchEventInstances(event.id));
        }
    }, [dispatch, event?.id]);

    const openCreateModal = () => {
        setSelectedInstance(null);
        dispatch(clearMyEventsError());
        setModalOpen(true);
    };

    const openEditModal = (instance) => {
        setSelectedInstance(instance);
        dispatch(clearMyEventsError());
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;

        setModalOpen(false);
        setSelectedInstance(null);
        dispatch(clearMyEventsError());
    };

    const handleSubmit = async (formData) => {
        try {
            if (selectedInstance) {
                await dispatch(
                    updateEventInstance({
                        instanceId: selectedInstance.id,
                        instanceData: formData,
                    })
                ).unwrap();
            } else {
                await dispatch(createEventInstance(formData)).unwrap();
            }

            setModalOpen(false);
            setSelectedInstance(null);
        } catch (err) {
            // Redux stores the error.
        }
    };

    const handleDelete = async (instance) => {
        const confirmed = window.confirm(
            `Delete "${instance.event_title}"? All its transactions and offerings will also be deleted.`
        );

        if (!confirmed) return;

        try {
            await dispatch(deleteEventInstance(instance.id)).unwrap();
        } catch (err) {
            window.alert(
                typeof err === "string"
                    ? err
                    : "Unable to delete this event."
            );
        }
    };

    const filteredInstances = instances.filter((instance) => {
        const search = searchTerm.trim().toLowerCase();

        return (
            instance.event_title?.toLowerCase().includes(search) ||
            instance.celebrated_person?.toLowerCase().includes(search)
        );
    });

    return (
        <div className="my-event-instances-page">
            <div className="my-event-instances-header">
                <div className="my-event-instances-heading">
                    <button
                        type="button"
                        className="my-event-instances-back"
                        onClick={onBack}
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div>
                        <h1>{event?.event_title}</h1>
                        <p>Manage individual celebrations and occasions.</p>
                    </div>
                </div>

                <button
                    type="button"
                    className="my-event-instances-create"
                    onClick={openCreateModal}
                >
                    <Plus size={18} />
                    Create Event
                </button>
            </div>

            <div className="my-event-instances-toolbar">
                <div className="my-event-instances-total">
                    <span>Total Celebrations</span>
                    <strong>{instances.length}</strong>
                </div>

                <div className="my-event-instances-search">
                    <Search size={17} />
                    <input
                        type="text"
                        placeholder="Search celebrations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="my-event-instances-error">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="my-event-instances-status">
                    Loading celebrations...
                </div>
            ) : filteredInstances.length > 0 ? (
                <div className="my-event-instances-grid">
                    {filteredInstances.map((instance) => (
                        <EventInstanceCard
                            key={instance.id}
                            instance={instance}
                            onClick={onSelectInstance}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="my-event-instances-empty">
                    <div className="my-event-instances-empty-icon">
                        <CalendarDays size={34} />
                    </div>

                    <h3>
                        {searchTerm
                            ? "No matching celebrations"
                            : "No celebrations created yet"}
                    </h3>

                    <p>
                        {searchTerm
                            ? "Try another search term."
                            : `Create your first ${event?.event_title || "event"} celebration.`}
                    </p>

                    {!searchTerm && (
                        <button
                            type="button"
                            className="my-event-instances-create"
                            onClick={openCreateModal}
                        >
                            <Plus size={18} />
                            Create First Event
                        </button>
                    )}
                </div>
            )}

            <EventInstanceFormModal
                isOpen={modalOpen}
                event={event}
                instance={selectedInstance}
                saving={saving}
                onClose={closeModal}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default EventInstances;
