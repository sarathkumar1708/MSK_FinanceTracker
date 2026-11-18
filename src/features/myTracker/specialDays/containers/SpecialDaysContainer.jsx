
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import SpecialDays from "../pages/SpecialDays/SpecialDays";
import { fetchSpecialDays } from "../store/specialDaysSlice";

const MONTHS = [
    { id: 1, name: "January", color: "blue" },
    { id: 2, name: "February", color: "pink" },
    { id: 3, name: "March", color: "green" },
    { id: 4, name: "April", color: "purple" },
    { id: 5, name: "May", color: "orange" },
    { id: 6, name: "June", color: "teal" },
    { id: 7, name: "July", color: "indigo" },
    { id: 8, name: "August", color: "rose" },
    { id: 9, name: "September", color: "cyan" },
    { id: 10, name: "October", color: "amber" },
    { id: 11, name: "November", color: "violet" },
    { id: 12, name: "December", color: "emerald" },
];

const getMonthDay = (date) => {
    if (!date) return null;

    const parts = String(date).split("-").map(Number);

    if (parts.length !== 3 || parts.some(Number.isNaN)) {
        return null;
    }

    return {
        month: parts[1],
        day: parts[2],
    };
};

const isCelebratingToday = (eventDate, todayMonth, todayDay) => {
    const event = getMonthDay(eventDate);

    return (
        event?.month === todayMonth &&
        event?.day === todayDay
    );
};

const getNextOccurrence = (eventDate, today) => {
    const event = getMonthDay(eventDate);

    if (!event) return null;

    const year = today.getFullYear();

    let nextDate = new Date(year, event.month - 1, event.day);

    // Handle February 29 on non-leap years by observing on February 28.
    if (
        event.month === 2 &&
        event.day === 29 &&
        nextDate.getMonth() !== 1
    ) {
        nextDate = new Date(year, 1, 28);
    }

    const todayStart = new Date(year, today.getMonth(), today.getDate());

    if (nextDate < todayStart) {
        nextDate = new Date(year + 1, event.month - 1, event.day);

        if (
            event.month === 2 &&
            event.day === 29 &&
            nextDate.getMonth() !== 1
        ) {
            nextDate = new Date(year + 1, 1, 28);
        }
    }

    return nextDate;
};

const formatShortDate = (date) =>
    date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
    });

function SpecialDaysContainer() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        specialDays = [],
        loading,
        error,
    } = useSelector((state) => state.specialDays || {});

    useEffect(() => {
        dispatch(fetchSpecialDays());
    }, [dispatch]);

    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    const monthData = useMemo(() => {
        return MONTHS.map((month) => {
            const monthEvents = specialDays
                .filter((event) => {
                    const date = getMonthDay(event.event_date);
                    return date?.month === month.id;
                })
                .sort((a, b) => {
                    const dateA = getMonthDay(a.event_date);
                    const dateB = getMonthDay(b.event_date);

                    return dateA.day - dateB.day;
                });

            const todaysEvents = monthEvents.filter((event) =>
                isCelebratingToday(event.event_date, todayMonth, todayDay)
            );

            const upcomingEvents = monthEvents
                .map((event) => ({
                    ...event,
                    nextDate: getNextOccurrence(event.event_date, today),
                }))
                .filter((event) => event.nextDate)
                .sort((a, b) => a.nextDate - b.nextDate)
                .slice(0, 3);

            return {
                ...month,
                events: monthEvents,
                totalCount: monthEvents.length,
                todaysEvents,
                upcomingEvents,
            };
        });
    }, [specialDays, todayMonth, todayDay]);

    const totalCount = specialDays.length;

    const todaysCelebrations = specialDays.filter((event) =>
        isCelebratingToday(event.event_date, todayMonth, todayDay)
    );

    const handleMonthClick = (month) => {
        navigate(`/my-tracker/special-days/${month.id}`);
    };

    return (
        <SpecialDays
            months={monthData}
            totalCount={totalCount}
            todaysCelebrations={todaysCelebrations}
            loading={loading}
            error={error}
            onMonthClick={handleMonthClick}
        />
    );
}

export default SpecialDaysContainer;
