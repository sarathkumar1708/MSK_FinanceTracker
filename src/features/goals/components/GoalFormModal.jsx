
import { useState } from "react";
import { Clock, X } from "lucide-react";

import "./GoalFormModal.css";

const GOAL_TYPES = [
    "Investment",
    "Purchase",
    "Debt Closing",
    "Education",
    "Professional",
    "Finance",
];

const getToday = () => {
    const date = new Date();

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");
};

export default function GoalFormModal({
    goal = null,
    onClose,
    onSubmit,
    saving = false,
}) {
    const isEditing = Boolean(goal);

    const [formData, setFormData] = useState({
        goal_name: goal?.goal_name || "",
        goal_type: goal?.goal_type || "",
        start_date: goal?.start_date?.slice(0, 10) || getToday(),
        remarks: goal?.remarks || "",
    });

    const [formError, setFormError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError("");

        if (!formData.goal_name.trim()) {
            setFormError("Please enter a goal name.");
            return;
        }

        if (!formData.goal_type) {
            setFormError("Please select a goal type.");
            return;
        }

        if (!formData.start_date) {
            setFormError("Please select a start date.");
            return;
        }

        try {
            await onSubmit({
                goal_name: formData.goal_name.trim(),
                goal_type: formData.goal_type,
                start_date: formData.start_date,
                remarks: formData.remarks.trim(),
                ...(isEditing
                    ? {}
                    : {
                        status: "pending",
                        closing_date: null,
                    }),
            });
            onClose();
        } catch (error) {
            setFormError(
                error.message ||
                `Unable to ${isEditing ? "update" : "create"} goal.`
            );
        }
    };

    return (
        <div
            className="goal-modal-overlay"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !saving
                ) {
                    onClose();
                }
            }}
        >
            <div className="goal-modal">
                <div className="goal-modal-header">
                    <div>
                        <h2>{isEditing ? "Edit Goal" : "Create New Goal"}</h2>
                        <p>
                            {isEditing
                                ? "Update your goal information."
                                : "Add a goal to your yearly plan."}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="goal-modal-close"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="goal-form-group">
                        <label htmlFor="goal_name">
                            Goal Name <span>*</span>
                        </label>

                        <input
                            id="goal_name"
                            name="goal_name"
                            type="text"
                            placeholder="Example: Close Personal Loan"
                            value={formData.goal_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="goal-form-group">
                        <label htmlFor="goal_type">
                            Goal Type <span>*</span>
                        </label>

                        <select
                            id="goal_type"
                            name="goal_type"
                            value={formData.goal_type}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select goal type</option>

                            {GOAL_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="goal-form-group">
                        <label htmlFor="start_date">
                            Start Date <span>*</span>
                        </label>

                        <input
                            id="start_date"
                            name="start_date"
                            type="date"
                            value={formData.start_date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Remarks */}
                    <div className="goal-form-group">
                        <label htmlFor="remarks">
                            Remarks
                        </label>

                        <textarea
                            id="remarks"
                            name="remarks"
                            rows={4}
                            placeholder="Enter additional details about this goal..."
                            value={formData.remarks}
                            onChange={handleChange}
                            maxLength={1000}
                        />

                        <small>
                            {formData.remarks.length}/1000 characters
                        </small>
                    </div>

                    {!isEditing && (
                        <div className="goal-form-group">
                            <label>Status</label>

                            <div className="goal-default-status">
                                <Clock size={16} />
                                Pending
                            </div>

                            <small>
                                New goals are created with Pending status.
                            </small>
                        </div>
                    )}

                    {formError && (
                        <div className="goal-form-error">
                            {formError}
                        </div>
                    )}

                    <div className="goal-modal-actions">
                        <button
                            type="button"
                            className="goal-cancel-btn"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="goal-save-btn"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : isEditing
                                    ? "Update Goal"
                                    : "Create Goal"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
