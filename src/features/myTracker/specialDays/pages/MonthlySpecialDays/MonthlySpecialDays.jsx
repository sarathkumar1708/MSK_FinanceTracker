
import {
    ArrowLeft,
    CalendarDays,
    Plus,
    Cake,
    PartyPopper,
    Heart,
    Gift,
} from "lucide-react";

import "./MonthlySpecialDays.css";

import SpecialDayTable from "../../components/SpecialDayTable/SpecialDayTable";
import SpecialDayModal from "../../components/SpecialDayModal/SpecialDayModal";

function MonthlySpecialDays({
    monthNumber,
    monthName,
    events = [],
    totalCount = 0,
    todayCount = 0,
    loading = false,
    saving = false,
    error,
    modalOpen,
    editingSpecialDay,
    onBack,
    onCreate,
    onEdit,
    onDelete,
    onCloseModal,
    onSave,
}) {
    return (
        <div className="monthly-special-days-page">

            {/* HEADER */}
            <div className="monthly-special-days-header">
                <div className="monthly-special-days-header-left">
                    <button
                        type="button"
                        className="monthly-special-days-back"
                        onClick={onBack}
                        title="Back to Special Days"
                    >
                        <ArrowLeft size={19} />
                    </button>

                    <div className="monthly-special-days-title-icon">
                        <CalendarDays size={25} />
                    </div>

                    <div>
                        <h1>{monthName} Celebrations</h1>
                        <p>
                            Manage birthdays, anniversaries and other
                            special occasions.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="monthly-special-days-create-btn"
                    onClick={onCreate}
                >
                    <Plus size={18} />
                    Create Special Day
                </button>
            </div>

            {/* SUMMARY */}
            <div className="monthly-special-days-summary">

                <div className="monthly-special-summary-card total">
                    <div className="monthly-special-summary-icon">
                        <Gift size={22} />
                    </div>

                    <div>
                        <span>Total Celebrations</span>
                        <strong>{totalCount}</strong>
                    </div>
                </div>

                <div className="monthly-special-summary-card today">
                    <div className="monthly-special-summary-icon">
                        <PartyPopper size={22} />
                    </div>

                    <div>
                        <span>Celebrating Today</span>
                        <strong>{todayCount}</strong>
                    </div>
                </div>

                <div className="monthly-special-summary-card birthdays">
                    <div className="monthly-special-summary-icon">
                        <Cake size={22} />
                    </div>

                    <div>
                        <span>Birthdays</span>
                        <strong>
                            {events.filter(
                                (event) =>
                                    event.category === "birthday" ||
                                    event.category === "baby_birthday"
                            ).length}
                        </strong>
                    </div>
                </div>

                <div className="monthly-special-summary-card anniversaries">
                    <div className="monthly-special-summary-icon">
                        <Heart size={22} />
                    </div>

                    <div>
                        <span>Anniversaries</span>
                        <strong>
                            {events.filter((event) =>
                                [
                                    "wedding_anniversary",
                                    "engagement_anniversary",
                                    "marriage_day",
                                    "housewarming_anniversary",
                                ].includes(event.category)
                            ).length}
                        </strong>
                    </div>
                </div>
            </div>

            {/* EVENTS TABLE */}
            <div className="monthly-special-days-content">
                <div className="monthly-special-days-section-heading">
                    <div>
                        <h2>{monthName} Special Days</h2>
                        <p>
                            {totalCount} celebration
                            {totalCount !== 1 ? "s" : ""} recorded
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="monthly-special-days-error">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="monthly-special-days-loading">
                        Loading celebrations...
                    </div>
                ) : (
                    <SpecialDayTable
                        events={events}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                )}
            </div>

            {/* CREATE / EDIT MODAL */}
            {modalOpen && (
                <SpecialDayModal
                    isOpen={modalOpen}
                    initialData={editingSpecialDay}
                    saving={saving}
                    error={error}
                    selectedMonth={monthNumber}
                    onClose={onCloseModal}
                    onSave={onSave}
                />
            )}
        </div>
    );
}

export default MonthlySpecialDays;
