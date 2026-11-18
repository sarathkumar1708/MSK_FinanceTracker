
import {
    Plus,
    Scale,
    CheckCircle2,
    CircleDashed,
    Ban,
    Search,
} from "lucide-react";

import JourneyCard from "../../components/JourneyCard/JourneyCard";
import JourneyFormModal from "../../components/JourneyFormModal/JourneyFormModal";

import "./Weightloss.css";

const TABS = [
    {
        key: "pending",
        label: "Pending",
        icon: CircleDashed,
    },
    {
        key: "completed",
        label: "Completed",
        icon: CheckCircle2,
    },
    {
        key: "dropped",
        label: "Dropped",
        icon: Ban,
    },
];

export default function Weightloss({
    journeys,
    loading,
    saving,
    error,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    selectedJourney,
    onCreate,
    onEdit,
    onCloseModal,
    onSubmitJourney,
    onOpenJourney,
    onDeleteJourney,
    onStatusChange,
}) {
    const counts = {
        pending: journeys.filter((item) => item.status === "pending").length,
        completed: journeys.filter((item) => item.status === "completed").length,
        dropped: journeys.filter((item) => item.status === "dropped").length,
    };

    const filteredJourneys = journeys.filter((journey) => {
        const matchesTab = journey.status === activeTab;
        const matchesSearch = journey.journey_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());

        return matchesTab && matchesSearch;
    });

    return (
        <div className="weightloss-page">
            <div className="weightloss-page-header">
                <div>
                    <div className="weightloss-eyebrow">
                        <Scale size={15} />
                        PERSONAL HEALTH TRACKER
                    </div>
                    <h1>Weightloss Journeys</h1>
                    <p>
                        Set your goals, track daily progress and stay
                        consistent with your journey.
                    </p>
                </div>

                <button
                    type="button"
                    className="weightloss-create-btn"
                    onClick={onCreate}
                >
                    <Plus size={18} />
                    Create Journey
                </button>
            </div>

            <div className="weightloss-summary-grid">
                <div className="weightloss-summary-card pending-card">
                    <div className="summary-card-icon">
                        <CircleDashed size={21} />
                    </div>
                    <div>
                        <span>Pending Journeys</span>
                        <strong>{counts.pending}</strong>
                        <small>Currently in progress</small>
                    </div>
                </div>

                <div className="weightloss-summary-card completed-card">
                    <div className="summary-card-icon">
                        <CheckCircle2 size={21} />
                    </div>
                    <div>
                        <span>Completed Journeys</span>
                        <strong>{counts.completed}</strong>
                        <small>Successfully completed</small>
                    </div>
                </div>

                <div className="weightloss-summary-card dropped-card">
                    <div className="summary-card-icon">
                        <Ban size={21} />
                    </div>
                    <div>
                        <span>Dropped Journeys</span>
                        <strong>{counts.dropped}</strong>
                        <small>Stopped journeys</small>
                    </div>
                </div>
            </div>

            <section className="weightloss-content-card">
                <div className="weightloss-section-heading">
                    <div>
                        <h2>My Journeys</h2>
                        <p>Manage your weightloss journey records.</p>
                    </div>

                    <div className="weightloss-search">
                        <Search size={16} />
                        <input
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            placeholder="Search journeys..."
                        />
                    </div>
                </div>

                <div className="weightloss-tabs">
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            type="button"
                            className={`weightloss-tab ${activeTab === key ? "active" : ""
                                }`}
                            onClick={() => setActiveTab(key)}
                        >
                            <Icon size={16} />
                            {label}
                            <span>{counts[key]}</span>
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="weightloss-error">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="weightloss-state">
                        Loading your journeys...
                    </div>
                ) : filteredJourneys.length === 0 ? (
                    <div className="weightloss-empty">
                        <div className="weightloss-empty-icon">
                            <Scale size={28} />
                        </div>
                        <h3>
                            {searchTerm
                                ? "No matching journeys found"
                                : `No ${activeTab} journeys yet`}
                        </h3>
                        <p>
                            {searchTerm
                                ? "Try another search term."
                                : activeTab === "pending"
                                    ? "Create your first weightloss journey to start tracking your progress."
                                    : "Journeys with this status will appear here."}
                        </p>

                        {activeTab === "pending" && !searchTerm && (
                            <button
                                type="button"
                                className="weightloss-create-btn"
                                onClick={onCreate}
                            >
                                <Plus size={17} />
                                Create Journey
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="weightloss-journey-grid">
                        {filteredJourneys.map((journey) => (
                            <JourneyCard
                                key={journey.id}
                                journey={journey}
                                onOpen={onOpenJourney}
                                onEdit={onEdit}
                                onDelete={onDeleteJourney}
                                onStatusChange={onStatusChange}
                            />
                        ))}
                    </div>
                )}
            </section>

            <JourneyFormModal
                isOpen={isModalOpen}
                onClose={onCloseModal}
                onSubmit={onSubmitJourney}
                journey={selectedJourney}
                saving={saving}
            />
        </div>
    );
}
