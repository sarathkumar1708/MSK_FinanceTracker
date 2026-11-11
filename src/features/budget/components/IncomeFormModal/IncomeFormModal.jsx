
import { useEffect, useState } from "react";
import { X, Wallet, IndianRupee } from "lucide-react";
import "./IncomeFormModal.css";

export default function IncomeFormModal({
    isOpen,
    onClose,
    onSubmit,
    income = null,
    saving = false,
}) {
    const [incomeTitle, setIncomeTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [formError, setFormError] = useState("");

    const isEditing = Boolean(income);

    useEffect(() => {
        if (!isOpen) return;

        setIncomeTitle(income?.income_title || "");
        setAmount(
            income?.amount !== undefined && income?.amount !== null
                ? String(income.amount)
                : ""
        );
        setNotes(income?.notes || "");
        setFormError("");
    }, [isOpen, income]);

    if (!isOpen) return null;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError("");

        const numericAmount = Number(amount);

        if (!incomeTitle.trim()) {
            setFormError("Please enter an income title.");
            return;
        }

        if (!amount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
            setFormError("Please enter a valid amount greater than zero.");
            return;
        }

        try {
            await onSubmit({
                income_title: incomeTitle.trim(),
                amount: numericAmount,
                notes: notes.trim() || null,
            });
        } catch (error) {
            setFormError(error?.message || "Unable to save income. Please try again.");
        }
    };

    return (
        <div className="income-modal-overlay" onMouseDown={onClose}>
            <div
                className="income-modal-container"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="income-modal-header">
                    <div className="income-modal-heading">
                        <div className="income-modal-icon">
                            <Wallet size={22} />
                        </div>

                        <div>
                            <h2>{isEditing ? "Update Income" : "Add Income"}</h2>
                            <p>
                                {isEditing
                                    ? "Update your income details"
                                    : "Add an income source to your monthly plan"}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="income-modal-close"
                        onClick={onClose}
                        disabled={saving}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="income-modal-body">
                        <div className="income-form-field">
                            <label htmlFor="income-title">
                                Income Title <span>*</span>
                            </label>

                            <input
                                id="income-title"
                                type="text"
                                placeholder="e.g. Monthly Salary"
                                value={incomeTitle}
                                onChange={(event) => setIncomeTitle(event.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="income-form-field">
                            <label htmlFor="income-amount">
                                Amount <span>*</span>
                            </label>

                            <div className="income-amount-input">
                                <IndianRupee size={18} />
                                <input
                                    id="income-amount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Enter amount"
                                    value={amount}
                                    onChange={(event) => setAmount(event.target.value)}
                                />
                            </div>
                        </div>

                        <div className="income-form-field">
                            <label htmlFor="income-notes">Notes</label>

                            <textarea
                                id="income-notes"
                                rows="3"
                                placeholder="Add optional notes..."
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                            />
                        </div>

                        {formError && (
                            <div className="income-form-error">
                                {formError}
                            </div>
                        )}
                    </div>

                    <div className="income-modal-footer">
                        <button
                            type="button"
                            className="income-modal-cancel"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="income-modal-submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : isEditing
                                    ? "Update Income"
                                    : "Save Income"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
