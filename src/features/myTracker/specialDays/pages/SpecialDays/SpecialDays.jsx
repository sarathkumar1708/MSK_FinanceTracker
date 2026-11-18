
import {
    CalendarDays,
    Cake,
    Heart,
    Gift,
    PartyPopper,
    Sparkles,
    ChevronRight,
    CalendarCheck,
} from "lucide-react";

import "./SpecialDays.css";

import SpecialDayMonthCard from "../../components/SpecialDayMonthCard/SpecialDayMonthCard";

const formatToday = () =>
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

function SpecialDays({
    months = [],
    totalCount = 0,
    todaysCelebrations = [],
    loading = false,
    error,
    onMonthClick,
}) {
    return (
        <div className="special-days-page">

            {/* PAGE HEADER */}
            <div className="special-days-header">
                <div className="special-days-header-content">
                    <div className="special-days-header-icon">
                        <CalendarDays size={25} />
                    </div>

                    <div>
                        <h1>Special Days</h1>
                        <p>
                            Celebrate and remember all your important
                            moments throughout the year.
                        </p>
                    </div>
                </div>

                <div className="special-days-header-date">
                    <CalendarCheck size={17} />
                    <span>{formatToday()}</span>
                </div>
            </div>

            {/* SUMMARY */}
            <div className="special-days-summary">

                <div className="special-days-summary-card total">
                    <div className="special-days-summary-icon">
                        <Gift />
                    </div>
                    <div>
                        <span>Total Celebrations</span>
                        <strong>{totalCount}</strong>
                    </div>
                </div>

                <div className="special-days-summary-card today">
                    <div className="special-days-summary-icon">
                        <PartyPopper />
                    </div>
                    <div>
                        <span>Celebrating Today</span>
                        <strong>{todaysCelebrations.length}</strong>
                    </div>
                </div>

                <div className="special-days-summary-card birthday">
                    <div className="special-days-summary-icon">
                        <Cake />
                    </div>
                    <div>
                        <span>Yearly Memories</span>
                        <strong>12 Months</strong>
                    </div>
                </div>
            </div>

            {/* TODAY'S CELEBRATIONS */}
            {todaysCelebrations.length > 0 && (
                <div className="special-days-today-banner">
                    <div className="special-days-today-heading">
                        <Sparkles size={20} />
                        <div>
                            <h3>Today's Celebrations!</h3>
                            <p>Make their day extra special.</p>
                        </div>
                    </div>

                    <div className="special-days-today-list">
                        {todaysCelebrations.map((event) => (
                            <div
                                className="special-days-today-person"
                                key={event.id}
                            >
                                <Heart size={17} />
                                <strong>{event.title}</strong>
                                <span>{event.category.replaceAll("_", " ")}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MONTH GRID */}
            <div className="special-days-section-heading">
                <div>
                    <h2>Explore by Month</h2>
                    <p>Select a month to view and manage celebrations.</p>
                </div>
            </div>

            {loading ? (
                <div className="special-days-loading">
                    Loading your special days...
                </div>
            ) : error ? (
                <div className="special-days-error">
                    {error}
                </div>
            ) : (
                <div className="special-days-month-grid">
                    {months.map((month) => (
                        <SpecialDayMonthCard
                            key={month.id}
                            month={month}
                            onClick={() => onMonthClick(month)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default SpecialDays;
