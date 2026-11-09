
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
    tenure_months: "",
    remaining_tenure_months: "",
    notes: "",
};

// Converts months into years and months.
const formatTenure = (months) => {
    if (months === "" || months === null || months === undefined) {
        return "";
    }

    const totalMonths = Number(months);

    if (!Number.isInteger(totalMonths) || totalMonths < 0) {
        return "";
    }

    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;

    const parts = [];

    if (years > 0) {
        parts.push(`${years} ${years === 1 ? "year" : "years"}`);
    }

    if (remainingMonths > 0) {
        parts.push(
            `${remainingMonths} ${
                remainingMonths === 1 ? "month" : "months"
            }`
        );
    }

    return parts.length > 0 ? parts.join(" ") : "0 months";
};

const getTenurePreview = (months) => {
    if (months === "" || months === null || months === undefined) {
        return "";
    }

    const value = Number(months);

    if (!Number.isInteger(value) || value < 0) {
        return "";
    }

    return `${value} ${value === 1 ? "month" : "months"} (${formatTenure(value)})`;
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
                          tenure_months: debt.tenure_months ?? "",
                          remaining_tenure_months:
                              debt.remaining_tenure_months ?? "",
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

        // Validate total tenure.
        if (
            formData.tenure_months !== "" &&
            (
                !Number.isInteger(Number(formData.tenure_months)) ||
                Number(formData.tenure_months) <= 0
            )
        ) {
            setFormError("Total tenure must be a positive whole number of months.");
            return;
        }

        // Validate remaining tenure.
        if (
            formData.remaining_tenure_months !== "" &&
            (
                !Number.isInteger(Number(formData.remaining_tenure_months)) ||
                Number(formData.remaining_tenure_months) < 0
            )
        ) {
            setFormError("Remaining tenure must be zero or a positive whole number of months.");
            return;
        }

        // Remaining tenure cannot exceed total tenure.
        if (
            formData.tenure_months !== "" &&
            formData.remaining_tenure_months !== "" &&
            Number(formData.remaining_tenure_months) >
                Number(formData.tenure_months)
        ) {
            setFormError(
                "Remaining tenure cannot be greater than total tenure."
            );
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
            tenure_months:
                formData.tenure_months === ""
                    ? null
                    : Number(formData.tenure_months),
            remaining_tenure_months:
                formData.remaining_tenure_months === ""
                    ? null
                    : Number(formData.remaining_tenure_months),
            notes: formData.notes.trim() || null,
        };

        try {
            await onSubmit(payload);
        } catch (error) {
            setFormError(error.message || "Unable to save debt.");
        }
    };

    return (
        <div
            className="debt-modal-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !loading) {
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
                                <option value="">Select debt type</option>

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

                        <div className="debt-form-group">
                            <label>Total Tenure (Months)</label>
                            <input
                                type="number"
                                name="tenure_months"
                                value={formData.tenure_months}
                                onChange={handleChange}
                                placeholder="e.g. 240"
                                min="1"
                                step="1"
                            />

                            {formData.tenure_months !== "" && (
                                <small className="debt-tenure-preview">
                                    {getTenurePreview(formData.tenure_months)}
                                </small>
                            )}
                        </div>

                        <div className="debt-form-group">
                            <label>Remaining Tenure (Months)</label>
                            <input
                                type="number"
                                name="remaining_tenure_months"
                                value={formData.remaining_tenure_months}
                                onChange={handleChange}
                                placeholder="e.g. 180"
                                min="0"
                                step="1"
                            />

                            {formData.remaining_tenure_months !== "" && (
                                <small className="debt-tenure-preview">
                                    {getTenurePreview(
                                        formData.remaining_tenure_months
                                    )}
                                </small>
                            )}
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
                        <p className="debt-form-error" role="alert">
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
