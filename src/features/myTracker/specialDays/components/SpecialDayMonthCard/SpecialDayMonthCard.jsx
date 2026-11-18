
import {
    CalendarDays,
    Cake,
    Heart,
    Gift,
    ChevronRight,
    Sparkles,
} from "lucide-react";

import "./SpecialDayMonthCard.css";

const categoryIcons = {
    birthday: Cake,
    wedding_anniversary: Heart,
    engagement_anniversary: Heart,
    marriage_day: Heart,
    baby_birthday: Cake,
    graduation_day: Gift,
    job_anniversary: Gift,
    housewarming_anniversary: Gift,
    religious_occasion: Sparkles,
    festival: Sparkles,
    other: CalendarDays,
};

function SpecialDayMonthCard({ month, onClick }) {
    const hasToday = month.todaysEvents?.length > 0;

    return (
        <button
            type="button"
            className={`special-month-card special-month-${month.color} ${hasToday ? "has-today" : ""
                }`}
            onClick={onClick}
        >
            <div className="special-month-card-top">
                <div className="special-month-card-icon">
                    <CalendarDays size={21} />
                </div>

                <span className="special-month-count">
                    {month.totalCount} {month.totalCount === 1 ? "Event" : "Events"}
                </span>
            </div>

            <div className="special-month-name">
                {month.name}
            </div>

            {hasToday ? (
                <div className="special-month-today">
                    <div className="special-month-today-label">
                        <Sparkles size={13} />
                        Celebrating Today
                    </div>

                    {month.todaysEvents.map((event) => (
                        <div
                            className="special-month-event special-month-event-today"
                            key={event.id}
                        >
                            <strong>{event.title}</strong>
                            <span>
                                {event.category.replaceAll("_", " ")}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="special-month-upcoming">
                    {month.upcomingEvents?.length > 0 ? (
                        <>
                            <span className="special-month-upcoming-label">
                                Upcoming
                            </span>

                            {month.upcomingEvents.slice(0, 2).map((event) => {
                                const Icon =
                                    categoryIcons[event.category] ||
                                    CalendarDays;

                                return (
                                    <div
                                        className="special-month-event"
                                        key={event.id}
                                    >
                                        <Icon size={14} />
                                        <span>{event.title}</span>
                                    </div>
                                );
                            })}
                        </>
                    ) : (
                        <span className="special-month-empty">
                            No celebrations yet
                        </span>
                    )}
                </div>
            )}

            <div className="special-month-card-footer">
                <span>View celebrations</span>
                <ChevronRight size={17} />
            </div>
        </button>
    );
}

export default SpecialDayMonthCard;
