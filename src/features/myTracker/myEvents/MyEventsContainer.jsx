
import React, { useState } from "react";

import MyEvents from "./pages/MyEvents/MyEvents";
import EventInstances from "./pages/EventInstances/EventInstances";
import EventDetails from "./pages/EventDetails/EventDetails";

const MyEventsContainer = () => {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedInstance, setSelectedInstance] = useState(null);

    // Open parent event
    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setSelectedInstance(null);
    };

    // Open individual celebration
    const handleSelectInstance = (instance) => {
        setSelectedInstance(instance);
    };

    // Back to parent events
    const handleBackToEvents = () => {
        setSelectedEvent(null);
        setSelectedInstance(null);
    };

    // Back to child events
    const handleBackToInstances = () => {
        setSelectedInstance(null);
    };

    if (selectedInstance && selectedEvent) {
        return (
            <EventDetails
                event={selectedEvent}
                instance={selectedInstance}
                onBack={handleBackToInstances}
            />
        );
    }

    if (selectedEvent) {
        return (
            <EventInstances
                event={selectedEvent}
                onBack={handleBackToEvents}
                onSelectInstance={handleSelectInstance}
            />
        );
    }

    return (
        <MyEvents
            onSelectEvent={handleSelectEvent}
        />
    );
};

export default MyEventsContainer;
