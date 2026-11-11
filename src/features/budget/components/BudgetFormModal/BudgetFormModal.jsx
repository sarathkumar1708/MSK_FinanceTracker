
import { useEffect, useMemo, useState } from "react";
import { X, Wallet, IndianRupee } from "lucide-react";

import "./BudgetFormModal.css";

export default function BudgetFormModal({
    isOpen,
    onClose,
    onSubmit,
    categories = [],
    budgetItem = null,
    saving = false,
}) {
    const [categoryId, setCategoryId] = useState("");
    const [plannedAmount, setPlannedAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [formError, setFormError] = useState("");

    const isEditing = Boolean(budgetItem);

    const groupedCategories = useMemo(() => {
        return categories.reduce((groups, category) => {
            const groupName = category.category_group || "Other Expenses";

            if (!groups[groupName]) {
                groups[groupName] = [];
            }

            groups[groupName].push(category);

            return groups;
        }, {});
    }, [categories]);

    useEffect(() => {
        if (!isOpen) return;

        setCategoryId(budgetItem?.category_id || "");
        setPlannedAmount(
            budgetItem?.planned_amount != null
                ? String(budgetItem.planned_amount)
                : ""
        );
        setNotes(budgetItem?.notes || "");
        setFormError("");
    }, [isOpen, budgetItem]);

    if (!isOpen) return null;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError("");

        if (!categoryId) {
            setFormError("Please select a budget category.");
            return;
        }

        const amount = Number(plannedAmount);

        if (!plannedAmount || !Number.isFinite(amount) || amount <= 0) {
            setFormError("Please enter a valid planned amount.");
            return;
        }

        try {
            await onSubmit({
                category_id: categoryId,
                planned_amount: amount,
                notes: notes.trim() || null,
            });
        } catch (error) {
            setFormError(error?.message || "Unable to save budget.");
        }
    };

    return (
        <div
            className="budget-modal-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) {
                    onClose();
                }
            }}
        >
            <div
                className="budget-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="budget-modal-title"
            >
                <div className="budget-modal-header">
                    <div className="budget-modal-title-group">
                        <div className="budget-modal-icon">
                            <Wallet size={21} />
                        </div>

                        <div>
                            <h2 id="budget-modal-title">
                                {isEditing ? "Edit Budget" : "Add Budget"}
                            </h2>

                            <p>
                                Set your planned monthly expense amount.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="budget-modal-close"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="budget-modal-body">

                        <div className="budget-form-field">
                            <label htmlFor="budget-category">
                                Budget Category
                                <span>*</span>
                            </label>

                            <select
                                id="budget-category"
                                value={categoryId}
                                onChange={(event) =>
                                    setCategoryId(event.target.value)
                                }
                                required
                            >
                                <option value="">
                                    Select a category
                                </option>

                                {Object.entries(groupedCategories).map(
                                    ([groupName, groupCategories]) => (
                                        <optgroup
                                            label={groupName}
                                            key={groupName}
                                        >
                                            {groupCategories.map((category) => (
                                                <option
                                                    value={category.id}
                                                    key={category.id}
                                                >
                                                    {category.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )
                                )}
                            </select>
                        </div>

                        <div className="budget-form-field">
                            <label htmlFor="planned-amount">
                                Planned Amount
                                <span>*</span>
                            </label>

                            <div className="budget-amount-input">
                                <IndianRupee size={17} />

                                <input
                                    id="planned-amount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    placeholder="Enter planned amount"
                                    value={plannedAmount}
                                    onChange={(event) =>
                                        setPlannedAmount(event.target.value)
                                    }
                                    required
                                />
                            </div>

                            <small>
                                Enter the amount you plan to spend in this category.
                            </small>
                        </div>

                        <div className="budget-form-field">
                            <label htmlFor="budget-notes">
                                Notes
                                <span className="optional-label">
                                    Optional
                                </span>
                            </label>

                            <textarea
                                id="budget-notes"
                                rows="3"
                                placeholder="Add any additional notes..."
                                value={notes}
                                onChange={(event) =>
                                    setNotes(event.target.value)
                                }
                            />
                        </div>

                        {formError && (
                            <div className="budget-form-error">
                                {formError}
                            </div>
                        )}
                    </div>

                    <div className="budget-modal-footer">
                        <button
                            type="button"
                            className="budget-modal-cancel"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="budget-modal-submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : isEditing
                                    ? "Update Budget"
                                    : "Save Budget"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
