
import { useMemo, useState } from "react";
import {
    Plus,
    Target,
    CheckCircle2,
    Clock,
    Pencil,
    Trash2,
} from "lucide-react";

import {
    DebtPageHeader,
    DebtSection,
} from "../../debt/components/DebtShared/DebtShared";

import "./Goals.css";
import GoalFormModal from "../components/GoalFormModal";

const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const formatDate = (date) => {
    if (!date) return "—";

    return new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};

const getGoalStatus = (status) =>
    String(status || "pending").toLowerCase();

export default function Goals({
    goals = [],
    onCreateGoal,
    onUpdateGoal,
    onDeleteGoal,
    saving = false,
    loading = false,
}) {
    const currentYear = new Date().getFullYear();

    const [selectedYear, setSelectedYear] = useState(
        String(currentYear)
    );

    const [activeTab, setActiveTab] = useState("pending");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [updatingGoalId, setUpdatingGoalId] = useState(null);
    const [deletingGoalId, setDeletingGoalId] = useState(null);
    const [actionError, setActionError] = useState("");

    // Available years
    const availableYears = useMemo(() => {
        const years = new Set([currentYear]);

        goals.forEach((goal) => {
            if (goal.start_date) {
                years.add(Number(goal.start_date.slice(0, 4)));
            }
        });

        return [...years].sort((a, b) => b - a);
    }, [goals, currentYear]);

    // Filter by selected year
    const yearFilteredGoals = useMemo(() => {
        return goals
            .filter(
                (goal) =>
                    goal.start_date?.slice(0, 4) === selectedYear
            )
            .sort((a, b) =>
                (b.start_date || "").localeCompare(a.start_date || "")
            );
    }, [goals, selectedYear]);

    // Summary counts
    const pendingCount = yearFilteredGoals.filter(
        (goal) => getGoalStatus(goal.status) === "pending"
    ).length;

    const completedCount = yearFilteredGoals.filter(
        (goal) => getGoalStatus(goal.status) === "completed"
    ).length;

    // Display only the selected tab's goals
    const filteredGoals = useMemo(() => {
        return yearFilteredGoals.filter(
            (goal) => getGoalStatus(goal.status) === activeTab
        );
    }, [yearFilteredGoals, activeTab]);

    // Open create modal
    const handleOpenCreateModal = () => {
        setSelectedGoal(null);
        setActionError("");
        setIsModalOpen(true);
    };

    // Open edit modal
    const handleOpenEditModal = (goal) => {
        setSelectedGoal(goal);
        setActionError("");
        setIsModalOpen(true);
    };

    // Close modal
    const handleCloseModal = () => {
        if (saving) return;

        setIsModalOpen(false);
        setSelectedGoal(null);
    };

    // Create or update goal
    const handleSaveGoal = async (payload) => {
        setActionError("");

        if (selectedGoal) {
            if (!onUpdateGoal) {
                throw new Error("Goal update handler is not configured.");
            }

            await onUpdateGoal({
                id: selectedGoal.id,
                updates: payload,
            });
        } else {
            if (!onCreateGoal) {
                throw new Error("Goal creation handler is not configured.");
            }

            await onCreateGoal(payload);
        }

        // Select the year of the saved goal
        setSelectedYear(payload.start_date.slice(0, 4));
    };

    // Update status
    const handleStatusChange = async (goal, newStatus) => {
        if (!onUpdateGoal) return;

        const status = getGoalStatus(newStatus);

        const updates = {
            status,
            closing_date:
                status === "completed" ? getToday() : null,
        };

        setUpdatingGoalId(goal.id);
        setActionError("");

        try {
            await onUpdateGoal({
                id: goal.id,
                updates,
            });
        } catch (error) {
            setActionError(
                error.message || "Unable to update goal status."
            );
        } finally {
            setUpdatingGoalId(null);
        }
    };

    // Delete goal
    const handleDeleteGoal = async (goal) => {
        if (!onDeleteGoal) {
            setActionError("Goal deletion handler is not configured.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${goal.goal_name}"?`
        );

        if (!confirmed) return;

        setDeletingGoalId(goal.id);
        setActionError("");

        try {
            await onDeleteGoal(goal.id);
        } catch (error) {
            setActionError(
                error.message || "Unable to delete goal."
            );
        } finally {
            setDeletingGoalId(null);
        }
    };

    const isEditing = Boolean(selectedGoal);

    return (
        <div className="goals-page">
            <DebtPageHeader
                title="Goals"
                description="Plan your yearly goals and track your progress."
            />

            {/* Year Filter and Create Button */}
            <div className="goals-toolbar">
                <div className="goals-year-filter">
                    <label htmlFor="goals-year">Select Year</label>

                    <select
                        id="goals-year"
                        value={selectedYear}
                        onChange={(event) =>
                            setSelectedYear(event.target.value)
                        }
                    >
                        {availableYears.map((year) => (
                            <option key={year} value={String(year)}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="button"
                    className="goals-create-btn"
                    onClick={handleOpenCreateModal}
                >
                    <Plus size={18} />
                    New Goal
                </button>
            </div>

            {/* Goal Summary */}
            <DebtSection title={`${selectedYear} Goal Summary`}>
                <div className="goals-summary-grid">
                    <div className="goals-summary-card total">
                        <div className="goals-summary-icon">
                            <Target size={21} />
                        </div>

                        <div>
                            <span>Total Goals</span>
                            <strong>{yearFilteredGoals.length}</strong>
                        </div>
                    </div>

                    <div className="goals-summary-card pending">
                        <div className="goals-summary-icon">
                            <Clock size={21} />
                        </div>

                        <div>
                            <span>Pending Goals</span>
                            <strong>{pendingCount}</strong>
                        </div>
                    </div>

                    <div className="goals-summary-card completed">
                        <div className="goals-summary-icon">
                            <CheckCircle2 size={21} />
                        </div>

                        <div>
                            <span>Completed Goals</span>
                            <strong>{completedCount}</strong>
                        </div>
                    </div>
                </div>
            </DebtSection>

            {/* Goal List */}
            <DebtSection title="Goal List">
                {actionError && (
                    <div className="goals-error">
                        {actionError}
                    </div>
                )}

                {/* Pending / Completed Tabs */}
                <div className="goals-tabs">
                    <button
                        type="button"
                        className={`goals-tab pending ${activeTab === "pending" ? "active" : ""
                            }`}
                        onClick={() => setActiveTab("pending")}
                    >
                        <Clock size={16} />
                        Pending
                        <span>{pendingCount}</span>
                    </button>

                    <button
                        type="button"
                        className={`goals-tab completed ${activeTab === "completed" ? "active" : ""
                            }`}
                        onClick={() => setActiveTab("completed")}
                    >
                        <CheckCircle2 size={16} />
                        Completed
                        <span>{completedCount}</span>
                    </button>
                </div>

                <div className="goals-table-wrapper">
                    <table className="goals-table">
                        <thead>
                            <tr>
                                <th>Goal Name</th>
                                <th>Goal Type</th>
                                <th>Status</th>
                                <th>Start Date</th>
                                <th>Closing Date</th>
                                <th>Remarks</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="goals-empty-state">
                                        Loading goals...
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {filteredGoals.map((goal) => {
                                        const status = getGoalStatus(
                                            goal.status
                                        );

                                        const isUpdating =
                                            updatingGoalId === goal.id;

                                        const isDeleting =
                                            deletingGoalId === goal.id;

                                        return (
                                            <tr key={goal.id}>
                                                <td>
                                                    <div className="goals-name-cell">
                                                        <Target size={17} />
                                                        <strong>
                                                            {goal.goal_name}
                                                        </strong>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="goals-type-badge">
                                                        {goal.goal_type}
                                                    </span>
                                                </td>

                                                <td>
                                                    <select
                                                        className={`goals-status-select ${status}`}
                                                        value={status}
                                                        disabled={
                                                            isUpdating ||
                                                            !onUpdateGoal
                                                        }
                                                        onChange={(event) =>
                                                            handleStatusChange(
                                                                goal,
                                                                event.target.value
                                                            )
                                                        }
                                                    >
                                                        <option value="pending">
                                                            Pending
                                                        </option>

                                                        <option value="completed">
                                                            Completed
                                                        </option>
                                                    </select>
                                                </td>

                                                <td>
                                                    {formatDate(goal.start_date)}
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            status === "completed"
                                                                ? "goals-closing-date completed"
                                                                : "goals-closing-date"
                                                        }
                                                    >
                                                        {formatDate(
                                                            goal.closing_date
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="goals-remarks">
                                                        {goal.remarks?.trim() || "—"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="goals-actions">
                                                        <button
                                                            type="button"
                                                            className="goals-edit-btn"
                                                            title="Edit goal"
                                                            disabled={
                                                                saving ||
                                                                isDeleting
                                                            }
                                                            onClick={() =>
                                                                handleOpenEditModal(
                                                                    goal
                                                                )
                                                            }
                                                        >
                                                            <Pencil size={16} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="goals-delete-btn"
                                                            title="Delete goal"
                                                            disabled={
                                                                saving ||
                                                                isDeleting
                                                            }
                                                            onClick={() =>
                                                                handleDeleteGoal(
                                                                    goal
                                                                )
                                                            }
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {filteredGoals.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="goals-empty-state"
                                            >
                                                <Target size={30} />

                                                <strong>
                                                    No {activeTab} goals found
                                                    for {selectedYear}
                                                </strong>

                                                <span>
                                                    {activeTab === "pending"
                                                        ? "Create a new goal to get started."
                                                        : "Completed goals will appear here."}
                                                </span>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </DebtSection>

            {/* Create / Edit Goal Modal */}
            {isModalOpen && (
                <GoalFormModal
                    key={selectedGoal?.id || "new-goal"}
                    goal={selectedGoal}
                    onClose={handleCloseModal}
                    onSubmit={handleSaveGoal}
                    saving={saving}
                />
            )}
        </div>
    );
}
