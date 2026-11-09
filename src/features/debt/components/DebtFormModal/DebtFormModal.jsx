
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import "./DebtFormModal.css";

const DEBT_TYPES = [
    { value: "home_loan", label: "Home Loan" },
    { value: "personal_loan", label: "Personal Loan" },
    { value: "app_loan", label: "App Loan" },
    { value: "credit_card", label: "Credit Card" },
    { value: "friends", label: "Friends" },
    { value: "magalir_kulu_loan", label: "Magalir Kulu Loan" },
    { value: "vehicle_loan", label: "Vehicle Loan" },
    { value: "education_loan", label: "Education Loan" },
    {
        value: "electronic_purchase_loan",
        label: "Electronic Purchase Loan",
    },
    { value: "finance_loan", label: "Finance Loan" },
    { value: "others", label: "Others" },
];

const initialFormData = {
    name: "",
    debt_type: "",
    lender: "",
    loan_number: "",
    start_date: "",
    original_amount: "",
    interest_rate: "",
    notes: "",
};

export default function DebtFormModal({
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
            setFormData(
                debt
                    ? {
                        name: debt.name || "",
                        debt_type: debt.debt_type || "",
                        lender: debt.lender || "",
                        loan_number:
                            debt.loan_number ||
                            debt.account_number_last4 ||
                            "",
                        start_date: debt.start_date || "",
                        original_amount: debt.original_amount ?? "",
                        interest_rate: debt.interest_rate ?? "",
                        notes: debt.notes || "",
                    }
                    : { ...initialFormData }
            );

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

        if (!formData.name.trim()) {
            setFormError("Please enter a debt name.");
            return;
        }

        if (!formData.debt_type) {
            setFormError("Please select a debt type.");
            return;
        }

        if (
            formData.original_amount === "" ||
            !Number.isFinite(Number(formData.original_amount)) ||
            Number(formData.original_amount) <= 0
        ) {
            setFormError("Please enter a valid original amount.");
            return;
        }

        if (
            formData.interest_rate !== "" &&
            (
                !Number.isFinite(Number(formData.interest_rate)) ||
                Number(formData.interest_rate) < 0
            )
        ) {
            setFormError("Please enter a valid interest rate.");
            return;
        }

        const payload = {
            ...formData,
            name: formData.name.trim(),
            debt_type: formData.debt_type,
            lender: formData.lender.trim() || null,
            loan_number: formData.loan_number.trim() || null,
            start_date: formData.start_date || null,
            original_amount: Number(formData.original_amount),
            interest_rate:
                formData.interest_rate === ""
                    ? null
                    : Number(formData.interest_rate),
            notes: formData.notes.trim() || null,
        };

        try {
            await onSubmit(payload);
        } catch (error) {
            setFormError(
                error.message || "Unable to save debt."
            );
        }
    };

    return (
        <div
            className="debt-modal-overlay"
            onMouseDown={(e) => {
                if (
                    e.target === e.currentTarget &&
                    !loading
                ) {
                    onClose();
                }
            }}
        >
            <div
                className="debt-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="debt-modal-title"
            >
                <div className="debt-modal-header">
                    <div>
                        <h2 id="debt-modal-title">
                            {debt ? "Edit Debt" : "Add New Debt"}
                        </h2>

                        <p>
                            Enter the details of your loan or outstanding debt.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="debt-icon-btn"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="debt-form-grid">
                        <div className="debt-form-group">
                            <label>Debt Name *</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. SBI Home Loan"
                                required
                            />
                        </div>

                        <div className="debt-form-group">
                            <label>Debt Type *</label>
                            <select
                                name="debt_type"
                                value={formData.debt_type}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select debt type
                                </option>

                                {DEBT_TYPES.map((type) => (
                                    <option
                                        key={type.value}
                                        value={type.value}
                                    >
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="debt-form-group">
                            <label>Lender / Bank</label>
                            <input
                                name="lender"
                                value={formData.lender}
                                onChange={handleChange}
                                placeholder="e.g. SBI"
                            />
                        </div>

                        <div className="debt-form-group">
                            <label>Loan Number</label>
                            <input
                                type="text"
                                name="loan_number"
                                value={formData.loan_number}
                                onChange={handleChange}
                                placeholder="Enter complete loan number"
                            />
                        </div>

                        <div className="debt-form-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="debt-form-group">
                            <label>Original Loan Amount *</label>
                            <input
                                type="number"
                                name="original_amount"
                                value={formData.original_amount}
                                onChange={handleChange}
                                placeholder="Enter amount"
                                min="0.01"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="debt-form-group">
                            <label>Interest Rate (%)</label>
                            <input
                                type="number"
                                name="interest_rate"
                                value={formData.interest_rate}
                                onChange={handleChange}
                                placeholder="e.g. 8.5"
                                min="0"
                                step="0.0001"
                            />
                        </div>

                        <div className="debt-form-group debt-form-full">
                            <label>Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Additional information..."
                                rows={3}
                            />
                        </div>
                    </div>

                    {formError && (
                        <p
                            className="debt-form-error"
                            role="alert"
                        >
                            {formError}
                        </p>
                    )}

                    <div className="debt-form-footer">
                        <button
                            type="button"
                            className="debt-btn debt-btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="debt-btn debt-btn-primary"
                            disabled={loading}
                        >
                            {loading
                                ? "Saving..."
                                : debt
                                    ? "Update Debt"
                                    : "Save Debt"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
