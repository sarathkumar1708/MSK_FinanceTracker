
import { useEffect, useState } from "react";
import {
    X,
    CalendarDays,
    Save,
    Gift,
    Heart,
    Sparkles,
} from "lucide-react";

import "./SpecialDayModal.css";

const CATEGORY_OPTIONS = [
    { value: "birthday", label: "Birthday" },
    { value: "wedding_anniversary", label: "Wedding Anniversary" },
    { value: "engagement_anniversary", label: "Engagement Anniversary" },
    { value: "marriage_day", label: "Marriage Day" },
    { value: "baby_birthday", label: "Baby Birthday" },
    { value: "graduation_day", label: "Graduation Day" },
    { value: "job_anniversary", label: "Job Anniversary" },
    { value: "housewarming_anniversary", label: "Housewarming Anniversary" },
    { value: "religious_occasion", label: "Religious Occasion" },
    { value: "festival", label: "Festival" },
    { value: "other", label: "Other" },
];

const getLocalDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getDefaultDate = (selectedMonth) => {
    const today = new Date();
    const year = today.getFullYear();

    if (!selectedMonth) {
        return getLocalDateString();
    }

    const month = Number(selectedMonth);
    const day =
        month === today.getMonth() + 1
            ? today.getDate()
            : 1;

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const INITIAL_FORM = {
    title: "",
    event_date: "",
    category: "birthday",
    remarks: "",
};

function SpecialDayModal({
    isOpen,
    initialData,
    saving,
    error,
    selectedMonth,
    onClose,
    onSave,
}) {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [validationError, setValidationError] = useState("");

    const isEditing = Boolean(initialData?.id);

    useEffect(() => {
        if (!isOpen) return;

        if (initialData) {
            setFormData({
                title: initialData.title || "",
                event_date: initialData.event_date || "",
                category: initialData.category || "other",
                remarks: initialData.remarks || "",
            });
        } else {
            setFormData({
                ...INITIAL_FORM,
                event_date: getDefaultDate(selectedMonth),
            });
        }

        setValidationError("");
    }, [isOpen, initialData, selectedMonth]);

    if (!isOpen) return null;

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setValidationError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const title = formData.title.trim();

        if (!title) {
            setValidationError("Please enter a name or occasion.");
            return;
        }

        if (!formData.event_date) {
            setValidationError("Please select an event date.");
            return;
        }

        if (!formData.category) {
            setValidationError("Please select a category.");
            return;
        }

        // New events created from a monthly page should belong to that month.
        if (!isEditing && selectedMonth) {
            const eventMonth = Number(formData.event_date.split("-")[1]);

            if (eventMonth !== Number(selectedMonth)) {
                setValidationError(
                    "Please select a date within the currently selected month."
                );
                return;
            }
        }

        try {
            await onSave({
                title,
                event_date: formData.event_date,
                category: formData.category,
                remarks: formData.remarks.trim(),
            });
        } catch (saveError) {
            setValidationError(
                saveError?.message || "Unable to save this special day."
            );
        }
    };

    const displayError = validationError || error;

    return (
        <div
            className="special-day-modal-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) {
                    onClose();
                }
            }}
        >
            <div
                className="special-day-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="special-day-modal-title"
            >
                <div className="special-day-modal-header">
                    <div className="special-day-modal-heading">
                        <div className="special-day-modal-icon">
                            {isEditing ? <Heart size={22} /> : <Gift size={22} />}
                        </div>

                        <div>
                            <h2 id="special-day-modal-title">
                                {isEditing ? "Edit Special Day" : "Add Special Day"}
                            </h2>
                            <p>
                                {isEditing
                                    ? "Update your celebration details."
                                    : "Save an important date to remember every year."}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="special-day-modal-close"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="special-day-modal-body">
                        {displayError && (
                            <div className="special-day-modal-error">
                                {displayError}
                            </div>
                        )}

                        <div className="special-day-form-group">
                            <label htmlFor="special-day-title">
                                Name / Occasion <span>*</span>
                            </label>

                            <input
                                id="special-day-title"
                                type="text"
                                name="title"
                                placeholder="e.g. Father's Birthday"
                                value={formData.title}
                                onChange={handleChange}
                                maxLength={120}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="special-day-form-row">
                            <div className="special-day-form-group">
                                <label htmlFor="special-day-date">
                                    Event Date <span>*</span>
                                </label>

                                <div className="special-day-input-icon">
                                    <CalendarDays size={17} />

                                    <input
                                        id="special-day-date"
                                        type="date"
                                        name="event_date"
                                        value={formData.event_date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="special-day-form-group">
                                <label htmlFor="special-day-category">
                                    Category <span>*</span>
                                </label>

                                <select
                                    id="special-day-category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    {CATEGORY_OPTIONS.map((category) => (
                                        <option
                                            key={category.value}
                                            value={category.value}
                                        >
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="special-day-form-group">
                            <label htmlFor="special-day-remarks">
                                Remarks
                                <span className="optional-label">Optional</span>
                            </label>

                            <textarea
                                id="special-day-remarks"
                                name="remarks"
                                placeholder="Add any notes or special details..."
                                value={formData.remarks}
                                onChange={handleChange}
                                rows={4}
                                maxLength={500}
                            />

                            <div className="special-day-character-count">
                                {formData.remarks.length}/500
                            </div>
                        </div>

                        <div className="special-day-recurring-note">
                            <Sparkles size={17} />
                            <span>
                                This date will be displayed as a yearly celebration.
                                You only need to save it once.
                            </span>
                        </div>
                    </div>

                    <div className="special-day-modal-footer">
                        <button
                            type="button"
                            className="special-day-cancel-btn"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="special-day-save-btn"
                            disabled={saving}
                        >
                            <Save size={17} />
                            {saving
                                ? "Saving..."
                                : isEditing
                                    ? "Update Special Day"
                                    : "Save Special Day"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SpecialDayModal;
