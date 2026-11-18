
import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import "./JourneyFormModal.css";

const getInitialForm = (journey) => ({
    journey_name: journey?.journey_name || "",
    from_date: journey?.from_date || "",
    to_date: journey?.to_date || "",
    initial_weight: journey?.initial_weight ?? "",
    height_cm: journey?.height_cm ?? "",
    target_weight: journey?.target_weight ?? "",
    last_updated_weight:
        journey?.last_updated_weight ?? journey?.initial_weight ?? "",
    notes: journey?.notes || "",
});

export default function JourneyFormModal({
    isOpen,
    onClose,
    onSubmit,
    journey = null,
    saving = false,
}) {
    const [form, setForm] = useState(getInitialForm(journey));
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setForm(getInitialForm(journey));
            setErrors({});
        }
    }, [isOpen, journey]);

    if (!isOpen) return null;

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => {
            const updated = { ...prev, [name]: value };

            // For a new journey, initialize latest weight from initial weight.
            // It remains independently editable by the user.
            if (
                name === "initial_weight" &&
                !journey &&
                !prev.last_updated_weight
            ) {
                updated.last_updated_weight = value;
            }

            return updated;
        });

        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const nextErrors = {};

        if (!form.journey_name.trim()) {
            nextErrors.journey_name = "Journey name is required.";
        }

        if (!form.from_date) {
            nextErrors.from_date = "Please select the starting date.";
        }

        if (!form.to_date) {
            nextErrors.to_date = "Please select the ending date.";
        }

        if (
            form.from_date &&
            form.to_date &&
            form.to_date < form.from_date
        ) {
            nextErrors.to_date = "To Date cannot be before From Date.";
        }

        [
            "initial_weight",
            "height_cm",
            "target_weight",
            "last_updated_weight",
        ].forEach((field) => {
            if (!form[field] || Number(form[field]) <= 0) {
                nextErrors[field] = "Enter a value greater than zero.";
            }
        });

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validate()) return;

        await onSubmit({
            ...form,
            initial_weight: Number(form.initial_weight),
            height_cm: Number(form.height_cm),
            target_weight: Number(form.target_weight),
            last_updated_weight: Number(form.last_updated_weight),
        });
    };

    return (
        <div
            className="journey-modal-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="journey-modal">
                <div className="journey-modal-header">
                    <div>
                        <span className="journey-modal-eyebrow">
                            WEIGHTLOSS TRACKER
                        </span>
                        <h2>{journey ? "Edit Journey" : "Create Journey"}</h2>
                        <p>
                            Set your journey dates and weight goals.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="journey-modal-close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="journey-modal-body">
                        <section className="journey-form-section">
                            <h3>Journey Information</h3>

                            <div className="journey-form-field full-width">
                                <label>Journey Name *</label>
                                <input
                                    name="journey_name"
                                    value={form.journey_name}
                                    onChange={handleChange}
                                    placeholder="e.g. Weightloss Journey 2026"
                                />
                                {errors.journey_name && (
                                    <small>{errors.journey_name}</small>
                                )}
                            </div>

                            <div className="journey-form-grid">
                                <div className="journey-form-field">
                                    <label>From Date *</label>
                                    <input
                                        type="date"
                                        name="from_date"
                                        value={form.from_date}
                                        onChange={handleChange}
                                    />
                                    {errors.from_date && (
                                        <small>{errors.from_date}</small>
                                    )}
                                </div>

                                <div className="journey-form-field">
                                    <label>To Date *</label>
                                    <input
                                        type="date"
                                        name="to_date"
                                        value={form.to_date}
                                        onChange={handleChange}
                                    />
                                    {errors.to_date && (
                                        <small>{errors.to_date}</small>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="journey-form-section">
                            <h3>Weight Information</h3>

                            <div className="journey-form-grid">
                                <div className="journey-form-field">
                                    <label>Initial Weight (kg) *</label>
                                    <input
                                        type="number"
                                        name="initial_weight"
                                        min="0.01"
                                        step="0.01"
                                        value={form.initial_weight}
                                        onChange={handleChange}
                                        placeholder="e.g. 85"
                                    />
                                    {errors.initial_weight && (
                                        <small>{errors.initial_weight}</small>
                                    )}
                                </div>

                                <div className="journey-form-field">
                                    <label>Height (cm) *</label>
                                    <input
                                        type="number"
                                        name="height_cm"
                                        min="0.01"
                                        step="0.01"
                                        value={form.height_cm}
                                        onChange={handleChange}
                                        placeholder="e.g. 165"
                                    />
                                    {errors.height_cm && (
                                        <small>{errors.height_cm}</small>
                                    )}
                                </div>

                                <div className="journey-form-field">
                                    <label>Expected Weight (kg) *</label>
                                    <input
                                        type="number"
                                        name="target_weight"
                                        min="0.01"
                                        step="0.01"
                                        value={form.target_weight}
                                        onChange={handleChange}
                                        placeholder="e.g. 65"
                                    />
                                    {errors.target_weight && (
                                        <small>{errors.target_weight}</small>
                                    )}
                                </div>

                                <div className="journey-form-field">
                                    <label>Last Updated Weight (kg) *</label>
                                    <input
                                        type="number"
                                        name="last_updated_weight"
                                        min="0.01"
                                        step="0.01"
                                        value={form.last_updated_weight}
                                        onChange={handleChange}
                                        placeholder="e.g. 85"
                                    />
                                    {errors.last_updated_weight && (
                                        <small>{errors.last_updated_weight}</small>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="journey-form-section">
                            <h3>Additional Notes</h3>
                            <div className="journey-form-field full-width">
                                <textarea
                                    name="notes"
                                    rows="3"
                                    value={form.notes}
                                    onChange={handleChange}
                                    placeholder="Add notes about your journey..."
                                />
                            </div>
                        </section>

                        {!journey && (
                            <div className="journey-default-status">
                                <span className="status-dot" />
                                New journey will be created as Pending
                            </div>
                        )}
                    </div>

                    <div className="journey-modal-footer">
                        <button
                            type="button"
                            className="journey-cancel-btn"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="journey-save-btn"
                            disabled={saving}
                        >
                            <Save size={17} />
                            {saving
                                ? "Saving..."
                                : journey
                                    ? "Save Changes"
                                    : "Create Journey"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
