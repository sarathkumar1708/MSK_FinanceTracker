import { useEffect, useState } from "react";
import { X } from "lucide-react";
import "./DebtPaymentModal.css";

const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const initialFormData = {
    paid_date: getTodayDate(),
    payment_type: "EMI",
    amount: "",
    principal_amount: "",
    interest_amount: "",
    balance_after_payment: "",
    payment_mode: "",
    transaction_reference: "",
    notes: "",
};

export default function DebtPaymentModal({
    isOpen,
    onClose,
    onSubmit,
    debt = null,
    loading = false,
}) {
    const [formData, setFormData] = useState(initialFormData);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setFormData({
                ...initialFormData,
                paid_date: getTodayDate(),
            });
            setFormError("");
        }
    }, [isOpen, debt]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        const totalAmount = Number(formData.amount);
        const principalAmount = Number(formData.principal_amount || 0);
        const interestAmount = Number(formData.interest_amount || 0);

        if (!formData.paid_date) {
            setFormError("Please select the payment date.");
            return;
        }

        if (!formData.payment_type) {
            setFormError("Please select a payment type.");
            return;
        }

        if (!formData.amount || totalAmount <= 0) {
            setFormError("Please enter a valid payment amount.");
            return;
        }

        if (principalAmount < 0 || interestAmount < 0) {
            setFormError("Principal and interest amounts cannot be negative.");
            return;
        }

        if (principalAmount + interestAmount > totalAmount) {
            setFormError(
                "Principal and interest amounts cannot exceed the total payment amount."
            );
            return;
        }

        if (
            formData.balance_after_payment !== "" &&
            Number(formData.balance_after_payment) < 0
        ) {
            setFormError("Balance after payment cannot be negative.");
            return;
        }

        const payload = {
            paid_date: formData.paid_date,
            payment_type: formData.payment_type,
            amount: totalAmount,
            principal_amount: principalAmount,
            interest_amount: interestAmount,
            balance_after_payment:
                formData.balance_after_payment === ""
                    ? null
                    : Number(formData.balance_after_payment),
            payment_mode: formData.payment_mode || null,
            transaction_reference:
                formData.transaction_reference.trim() || null,
            notes: formData.notes.trim() || null,
        };

        try {
            await onSubmit(payload);
        } catch (error) {
            setFormError(error?.message || "Unable to save payment.");
        }
    };

    return (
        <div
            className="debt-payment-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !loading) {
                    onClose();
                }
            }}
        >
            <div
                className="debt-payment-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="debt-payment-title"
            >
                <div className="debt-payment-header">
                    <div>
                        <h2 id="debt-payment-title">Record Payment</h2>
                        <p>
                            {debt?.name
                                ? `Record a payment for ${debt.name}`
                                : "Enter the payment details below."}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="debt-payment-close"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {debt && (
                    <div className="debt-payment-info">
                        <span>Debt</span>
                        <strong>{debt.name}</strong>
                        {debt.lender && <span> · {debt.lender}</span>}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="debt-payment-grid">
                        <div className="debt-payment-field">
                            <label>Payment Date *</label>
                            <input
                                type="date"
                                name="paid_date"
                                value={formData.paid_date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="debt-payment-field">
                            <label>Payment Type *</label>
                            <select
                                name="payment_type"
                                value={formData.payment_type}
                                onChange={handleChange}
                                required
                            >
                                <option value="EMI">EMI</option>
                                <option value="PART_PAYMENT">Part Payment</option>
                            </select>
                        </div>

                        <div className="debt-payment-field">
                            <label>Total Payment Amount *</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="Enter total payment"
                                min="0.01"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="debt-payment-field">
                            <label>Principal Amount</label>
                            <input
                                type="number"
                                name="principal_amount"
                                value={formData.principal_amount}
                                onChange={handleChange}
                                placeholder="Enter principal amount"
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="debt-payment-field">
                            <label>Interest Amount</label>
                            <input
                                type="number"
                                name="interest_amount"
                                value={formData.interest_amount}
                                onChange={handleChange}
                                placeholder="Enter interest amount"
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="debt-payment-field">
                            <label>Balance After Payment</label>
                            <input
                                type="number"
                                name="balance_after_payment"
                                value={formData.balance_after_payment}
                                onChange={handleChange}
                                placeholder="Optional"
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="debt-payment-field">
                            <label>Payment Mode</label>
                            <select
                                name="payment_mode"
                                value={formData.payment_mode}
                                onChange={handleChange}
                            >
                                <option value="">Select payment mode</option>
                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                <option value="UPI">UPI</option>
                                <option value="CASH">Cash</option>
                                <option value="CHEQUE">Cheque</option>
                                <option value="AUTO_DEBIT">Auto Debit</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <div className="debt-payment-field">
                            <label>Transaction Reference</label>
                            <input
                                type="text"
                                name="transaction_reference"
                                value={formData.transaction_reference}
                                onChange={handleChange}
                                placeholder="Optional reference number"
                            />
                        </div>

                        <div className="debt-payment-field debt-payment-full">
                            <label>Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Additional payment details..."
                                rows={3}
                            />
                        </div>
                    </div>

                    {formError && (
                        <p className="debt-payment-error" role="alert">
                            {formError}
                        </p>
                    )}

                    <div className="debt-payment-footer">
                        <button
                            type="button"
                            className="debt-payment-btn debt-payment-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="debt-payment-btn debt-payment-primary"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Payment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}