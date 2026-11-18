
import { useEffect, useState } from "react";
import { X, Scale, CalendarDays, FileText, Save } from "lucide-react";

import "./UpdateWeightModal.css";

function getTodayDate() {
    const today = new Date();
    const offset = today.getTimezoneOffset();

    return new Date(today.getTime() - offset * 60000)
        .toISOString()
        .split("T")[0];
}

function UpdateWeightModal({
    isOpen,
    onClose,
    onSave,
    saving = false,
    journey,
    transaction = null,
}) {
    const [formData, setFormData] = useState({
        update_date: getTodayDate(),
        weight: "",
        notes: "",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isOpen) return;

        setFormData({
            update_date: transaction?.update_date || getTodayDate(),
            weight: transaction?.weight ?? "",
            notes: transaction?.notes || "",
        });

        setErrors({});
    }, [isOpen, transaction]);

    if (!isOpen) return null;

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.update_date) {
            newErrors.update_date = "Please select an update date.";
        }

        const weight = Number(formData.weight);

        if (!formData.weight || !Number.isFinite(weight) || weight <= 0) {
            newErrors.weight = "Enter a valid weight greater than zero.";
        }

        if (
            journey?.from_date &&
            formData.update_date < journey.from_date
        ) {
            newErrors.update_date =
                "Update date cannot be before the journey start date.";
        }

        if (
            journey?.to_date &&
            formData.update_date > journey.to_date
        ) {
            newErrors.update_date =
                "Update date cannot be after the journey end date.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) return;

        await onSave({
            ...(transaction?.id ? { id: transaction.id } : {}),
            journey_id: journey.id,
            update_date: formData.update_date,
            weight: Number(formData.weight),
            notes: formData.notes.trim(),
        });
    };

    return (
        <div
            className="weight-update-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) {
                    onClose();
                }
            }}
        >
            <div
                className="weight-update-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="weight-update-title"
            >
                <div className="weight-update-header">
                    <div className="weight-update-heading">
                        <div className="weight-update-icon">
                            <Scale size={22} />
                        </div>

                        <div>
                            <h2 id="weight-update-title">
                                {transaction ? "Edit Weight Update" : "Update Weight"}
                            </h2>
                            <p>
                                {journey?.journey_name || "Weightloss Journey"}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="weight-update-close"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="weight-update-body">
                        <div className="weight-update-info">
                            Record your current weight to keep your journey
                            progress and history up to date.
                        </div>

                        <div className="weight-update-field">
                            <label htmlFor="update_date">
                                <CalendarDays size={15} />
                                Update Date <span>*</span>
                            </label>

                            <input
                                id="update_date"
                                type="date"
                                name="update_date"
                                value={formData.update_date}
                                min={journey?.from_date || undefined}
                                max={journey?.to_date || undefined}
                                onChange={handleChange}
                            />

                            {errors.update_date && (
                                <small className="weight-update-error">
                                    {errors.update_date}
                                </small>
                            )}
                        </div>

                        <div className="weight-update-field">
                            <label htmlFor="weight">
                                <Scale size={15} />
                                Current Weight (kg) <span>*</span>
                            </label>

                            <div className="weight-update-input-wrap">
                                <input
                                    id="weight"
                                    type="number"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    placeholder="Enter your current weight"
                                    min="0.1"
                                    max="1000"
                                    step="0.01"
                                />
                                <span>kg</span>
                            </div>

                            {errors.weight && (
                                <small className="weight-update-error">
                                    {errors.weight}
                                </small>
                            )}
                        </div>

                        <div className="weight-update-field">
                            <label htmlFor="notes">
                                <FileText size={15} />
                                Notes
                            </label>

                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Add notes about your weight update..."
                                rows={4}
                                maxLength={1000}
                            />

                            <small className="weight-update-character-count">
                                {formData.notes.length}/1000 characters
                            </small>
                        </div>
                    </div>

                    <div className="weight-update-footer">
                        <button
                            type="button"
                            className="weight-update-cancel"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="weight-update-submit"
                            disabled={saving}
                        >
                            <Save size={17} />
                            {saving
                                ? "Saving..."
                                : transaction
                                    ? "Save Changes"
                                    : "Save Weight"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UpdateWeightModal;
