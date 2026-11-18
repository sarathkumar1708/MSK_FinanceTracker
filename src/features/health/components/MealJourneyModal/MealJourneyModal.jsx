
import { useEffect, useState } from "react";
import { X, CalendarDays, FileText, Flag } from "lucide-react";
import "./MealJourneyModal.css";

const initialForm = {
    journey_name: "",
    from_date: "",
    to_date: "",
    status: "active",
    notes: "",
};

function MealJourneyModal({
    isOpen,
    onClose,
    onSubmit,
    saving = false,
    initialData = null,
}) {
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setForm(
                initialData
                    ? {
                        journey_name: initialData.journey_name || "",
                        from_date: initialData.from_date || "",
                        to_date: initialData.to_date || "",
                        status: initialData.status || "active",
                        notes: initialData.notes || "",
                    }
                    : initialForm
            );
            setError("");
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.journey_name.trim()) {
            setError("Please enter a journey name.");
            return;
        }

        if (!form.from_date || !form.to_date) {
            setError("Please select both start and end dates.");
            return;
        }

        if (form.to_date < form.from_date) {
            setError("End date cannot be earlier than start date.");
            return;
        }

        try {
            await onSubmit({
                ...form,
                journey_name: form.journey_name.trim(),
                notes: form.notes.trim(),
            });
        } catch {
            // The parent handles and displays the save error.
        }
    };

    return (
        <div className="meal-journey-modal-overlay" onMouseDown={onClose}>
            <div
                className="meal-journey-modal"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="meal-journey-modal-header">
                    <div className="meal-journey-modal-heading">
                        <div className="meal-journey-modal-icon">
                            <CalendarDays size={22} />
                        </div>

                        <div>
                            <h2>
                                {initialData
                                    ? "Edit Meal Journey"
                                    : "Create Meal Journey"}
                            </h2>
                            <p>
                                Organise your meals and track daily nutrition.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="meal-journey-close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="meal-journey-modal-body">
                        <div className="meal-form-group">
                            <label htmlFor="journey_name">
                                Journey Name <span>*</span>
                            </label>
                            <input
                                id="journey_name"
                                name="journey_name"
                                type="text"
                                placeholder="Example: Healthy Weight Loss Journey"
                                value={form.journey_name}
                                onChange={handleChange}
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="meal-form-row">
                            <div className="meal-form-group">
                                <label htmlFor="from_date">
                                    Start Date <span>*</span>
                                </label>
                                <input
                                    id="from_date"
                                    name="from_date"
                                    type="date"
                                    value={form.from_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="meal-form-group">
                                <label htmlFor="to_date">
                                    End Date <span>*</span>
                                </label>
                                <input
                                    id="to_date"
                                    name="to_date"
                                    type="date"
                                    min={form.from_date || undefined}
                                    value={form.to_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="meal-form-group">
                            <label htmlFor="status">
                                <Flag size={15} />
                                Journey Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                            >
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        <div className="meal-form-group">
                            <label htmlFor="notes">
                                <FileText size={15} />
                                Notes
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                rows="3"
                                placeholder="Add your journey goals or notes..."
                                value={form.notes}
                                onChange={handleChange}
                            />
                        </div>

                        {error && (
                            <div className="meal-form-error">{error}</div>
                        )}
                    </div>

                    <div className="meal-journey-modal-footer">
                        <button
                            type="button"
                            className="meal-btn-secondary"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="meal-btn-primary"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : initialData
                                    ? "Update Journey"
                                    : "Create Journey"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default MealJourneyModal;
