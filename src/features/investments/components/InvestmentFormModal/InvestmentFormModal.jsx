
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { INVESTMENT_TYPES } from "../InvestmentShared/InvestmentShared";
import "./InvestmentFormModal.css";

const INITIAL_FORM = {
    name: "",
    investment_type: "Others",
    provider: "",
    account_number_last4: "",
    start_date: new Date().toISOString().slice(0, 10),
    target_amount: "",
    monthly_contribution: "",
    notes: "",
};

export default function InvestmentFormModal({
    isOpen,
    investment = null,
    saving = false,
    onClose,
    onSubmit,
}) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [error, setError] = useState("");

    // Prepare form data when the modal opens
    useEffect(() => {
        if (!isOpen) return;

        if (investment) {
            setForm({
                name: investment.name || "",
                investment_type: investment.investment_type || "Others",
                provider: investment.provider || "",
                account_number_last4:
                    investment.account_number_last4 || "",
                start_date:
                    investment.start_date ||
                    new Date().toISOString().slice(0, 10),
                target_amount: investment.target_amount ?? "",
                monthly_contribution:
                    investment.monthly_contribution ?? "",
                notes: investment.notes || "",
            });
        } else {
            setForm(INITIAL_FORM);
        }

        setError("");
    }, [isOpen, investment]);

    // Lock background scrolling while modal is open
    useEffect(() => {
        if (!isOpen) return;

        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow =
            document.documentElement.style.overflow;

        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow =
                previousHtmlOverflow;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setError("");

        if (!form.name.trim()) {
            setError("Investment name is required.");
            return;
        }

        if (
            form.account_number_last4 &&
            !/^\d{4}$/.test(form.account_number_last4)
        ) {
            setError("Enter exactly 4 digits for the account number.");
            return;
        }

        if (
            form.target_amount !== "" &&
            Number(form.target_amount) < 0
        ) {
            setError("Target amount cannot be negative.");
            return;
        }

        if (
            form.monthly_contribution !== "" &&
            Number(form.monthly_contribution) < 0
        ) {
            setError("Monthly contribution cannot be negative.");
            return;
        }

        onSubmit({
            ...form,
            name: form.name.trim(),
            provider: form.provider.trim() || null,
            account_number_last4:
                form.account_number_last4 || null,
            target_amount:
                form.target_amount === ""
                    ? null
                    : Number(form.target_amount),
            monthly_contribution:
                form.monthly_contribution === ""
                    ? null
                    : Number(form.monthly_contribution),
            notes: form.notes.trim() || null,
        });
    };

    // Render outside the application layout to avoid parent CSS interference
    return createPortal(
        <div
            className="investment-modal-overlay"
            onMouseDown={onClose}
        >
            <div
                className="investment-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="investment-modal-title"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="investment-modal-header">
                    <div>
                        <h2 id="investment-modal-title">
                            {investment
                                ? "Edit Investment"
                                : "Add Investment"}
                        </h2>

                        <p>Enter your investment details.</p>
                    </div>

                    <button
                        type="button"
                        className="investment-modal-close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="investment-form-grid">
                        <div className="investment-form-field">
                            <label>Investment Name *</label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Example: SBI Mutual Fund"
                                required
                            />
                        </div>

                        <div className="investment-form-field">
                            <label>Investment Type *</label>
                            <select
                                name="investment_type"
                                value={form.investment_type}
                                onChange={handleChange}
                                required
                            >
                                {INVESTMENT_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="investment-form-field">
                            <label>Provider / Institution</label>
                            <input
                                name="provider"
                                value={form.provider}
                                onChange={handleChange}
                                placeholder="Bank, company or person"
                            />
                        </div>

                        <div className="investment-form-field">
                            <label>
                                Account Number (Last 4 Digits)
                            </label>
                            <input
                                name="account_number_last4"
                                value={form.account_number_last4}
                                onChange={handleChange}
                                maxLength={4}
                                inputMode="numeric"
                                placeholder="1234"
                            />
                        </div>

                        <div className="investment-form-field">
                            <label>Start Date *</label>
                            <input
                                type="date"
                                name="start_date"
                                value={form.start_date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="investment-form-field">
                            <label>Target Amount</label>
                            <input
                                type="number"
                                name="target_amount"
                                min="0"
                                value={form.target_amount}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>

                        <div className="investment-form-field">
                            <label>Monthly Contribution</label>
                            <input
                                type="number"
                                name="monthly_contribution"
                                min="0"
                                value={form.monthly_contribution}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>

                        <div className="investment-form-field full-width">
                            <label>Notes</label>
                            <textarea
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Additional information..."
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="investment-form-error">
                            {error}
                        </div>
                    )}

                    <div className="investment-modal-actions">
                        <button
                            type="button"
                            className="investment-cancel-btn"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="investment-save-btn"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : investment
                                    ? "Update Investment"
                                    : "Create Investment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
