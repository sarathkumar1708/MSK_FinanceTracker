
import {
    Plus,
    HeartPulse,
    CalendarDays,
    Activity,
    Utensils,
    Search,
} from "lucide-react";

import MealJourneyCard from "../../components/MealJourneyCard/MealJourneyCard";
import MealJourneyModal from "../../components/MealJourneyModal/MealJourneyModal";

import "./MealsPlanner.css";

const filters = [
    { label: "All Journeys", value: "all" },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
    { label: "Archived", value: "archived" },
];

function MealsPlanner({
    journeys = [],
    loading,
    saving,
    error,
    filter,
    onFilterChange,
    search,
    onSearchChange,
    isModalOpen,
    editingJourney,
    onOpenCreate,
    onCloseModal,
    onSubmitJourney,
    onEditJourney,
    onDeleteJourney,
    onOpenJourney,
}) {
    const counts = {
        all: journeys.length,
        active: journeys.filter((item) => item.status === "active").length,
        completed: journeys.filter((item) => item.status === "completed").length,
        archived: journeys.filter((item) => item.status === "archived").length,
    };

    const filteredJourneys = journeys.filter((journey) => {
        const matchesFilter =
            filter === "all" || journey.status === filter;

        const matchesSearch = journey.journey_name
            ?.toLowerCase()
            .includes(search.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    return (
        <div className="meals-planner-page">
            {/* PAGE HEADER */}
            <div className="meals-planner-header">
                <div className="meals-planner-heading">
                    <div className="meals-planner-heading-icon">
                        <HeartPulse size={25} />
                    </div>

                    <div>
                        <h1>Meals Planner</h1>
                        <p>
                            Plan your meals, monitor nutrition and build
                            healthier eating habits.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="meals-create-journey-btn"
                    onClick={onOpenCreate}
                >
                    <Plus size={18} />
                    <span>Create Journey</span>
                </button>
            </div>

            {/* INTRODUCTION CARD */}
            <section className="meals-planner-welcome">
                <div className="meals-welcome-content">
                    <span className="meals-welcome-eyebrow">
                        YOUR DAILY NUTRITION COMPANION
                    </span>

                    <h2>Eat Better. Track Better. Feel Better.</h2>

                    <p>
                        Organise your weekly meals and track calories,
                        protein, carbohydrates and fat throughout your
                        health journey.
                    </p>

                    <div className="meals-welcome-highlights">
                        <span>
                            <CalendarDays size={15} />
                            Weekly planning
                        </span>
                        <span>
                            <Activity size={15} />
                            Nutrition tracking
                        </span>
                        <span>
                            <Utensils size={15} />
                            Meal management
                        </span>
                    </div>
                </div>

                <div className="meals-welcome-illustration">
                    <div className="meals-welcome-circle circle-one" />
                    <div className="meals-welcome-circle circle-two" />
                    <div className="meals-welcome-food-icon">
                        <Utensils size={55} />
                    </div>
                    <span className="meals-welcome-leaf leaf-one">✦</span>
                    <span className="meals-welcome-leaf leaf-two">✧</span>
                </div>
            </section>

            {/* SUMMARY CARDS */}
            <section className="meals-journey-summary">
                <div className="meals-summary-card summary-total">
                    <div className="meals-summary-icon">
                        <CalendarDays size={21} />
                    </div>
                    <div>
                        <span>Total Journeys</span>
                        <strong>{counts.all}</strong>
                    </div>
                </div>

                <div className="meals-summary-card summary-active">
                    <div className="meals-summary-icon">
                        <Activity size={21} />
                    </div>
                    <div>
                        <span>Active Journeys</span>
                        <strong>{counts.active}</strong>
                    </div>
                </div>

                <div className="meals-summary-card summary-completed">
                    <div className="meals-summary-icon">
                        <HeartPulse size={21} />
                    </div>
                    <div>
                        <span>Completed</span>
                        <strong>{counts.completed}</strong>
                    </div>
                </div>
            </section>

            {/* JOURNEY SECTION */}
            <section className="meals-journeys-section">
                <div className="meals-journeys-heading">
                    <div>
                        <h2>My Meal Journeys</h2>
                        <p>Choose a journey to view its weekly meal planner.</p>
                    </div>

                    <div className="meals-journey-search">
                        <Search size={17} />
                        <input
                            type="search"
                            placeholder="Search journeys..."
                            value={search}
                            onChange={(event) =>
                                onSearchChange(event.target.value)
                            }
                        />
                    </div>
                </div>

                {/* FILTER TABS */}
                <div className="meals-journey-filters">
                    {filters.map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            className={
                                filter === item.value
                                    ? "meal-filter-tab active"
                                    : "meal-filter-tab"
                            }
                            onClick={() => onFilterChange(item.value)}
                        >
                            {item.label}
                            <span>{counts[item.value]}</span>
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="meals-page-error">
                        {error}
                    </div>
                )}

                {/* LOADING */}
                {loading && (
                    <div className="meals-loading-state">
                        <div className="meals-loader" />
                        <p>Loading your meal journeys...</p>
                    </div>
                )}

                {/* JOURNEY CARDS */}
                {!loading && filteredJourneys.length > 0 && (
                    <div className="meals-journey-grid">
                        {filteredJourneys.map((journey) => (
                            <MealJourneyCard
                                key={journey.id}
                                journey={journey}
                                onClick={() => onOpenJourney(journey)}
                                onEdit={onEditJourney}
                                onDelete={onDeleteJourney}
                            />
                        ))}
                    </div>
                )}

                {/* EMPTY STATE */}
                {!loading && filteredJourneys.length === 0 && (
                    <div className="meals-empty-state">
                        <div className="meals-empty-icon">
                            <Utensils size={30} />
                        </div>

                        <h3>
                            {search
                                ? "No matching journeys found"
                                : filter === "all"
                                    ? "Start Your First Meal Journey"
                                    : `No ${filter} journeys`}
                        </h3>

                        <p>
                            {search
                                ? "Try a different search term."
                                : "Create a journey to start organising your weekly meals and tracking nutrition."}
                        </p>

                        {!search && filter === "all" && (
                            <button
                                type="button"
                                className="meals-create-journey-btn empty-create-btn"
                                onClick={onOpenCreate}
                            >
                                <Plus size={17} />
                                Create Your First Journey
                            </button>
                        )}
                    </div>
                )}
            </section>

            {/* CREATE / EDIT MODAL */}
            <MealJourneyModal
                isOpen={isModalOpen}
                onClose={onCloseModal}
                onSubmit={onSubmitJourney}
                saving={saving}
                initialData={editingJourney}
            />
        </div>
    );
}

export default MealsPlanner;
