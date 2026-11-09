
import { useMemo, useState } from "react";

import {
    ArrowLeft,
    House,
    UserRound,
    Smartphone,
    CreditCard,
    Users,
    Landmark,
    CarFront,
    GraduationCap,
    Laptop,
    Banknote,
    CircleEllipsis,
    Plus,
    Pencil,
    X,
    Save,
    Trash2,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

import {
    DebtPageHeader,
    DebtSection,
    formatCurrency,
    formatTenure,
} from "../../components/DebtShared/DebtShared";

import DebtCategoryCard from "../../components/DebtCategoryCard/DebtCategoryCard";
import DebtPaymentModal from "../../components/DebtPaymentModal/DebtPaymentModal";

import "./MonthlyDebtUpdate.css";

const DEBT_CATEGORIES = [
    { value: "home_loan", label: "Home Loan", icon: House },
    { value: "personal_loan", label: "Personal Loan", icon: UserRound },
    { value: "app_loan", label: "App Loan", icon: Smartphone },
    { value: "credit_card", label: "Credit Card", icon: CreditCard },
    { value: "friends", label: "Friends", icon: Users },
    { value: "magalir_kulu_loan", label: "Magalir Kulu Loan", icon: Landmark },
    { value: "vehicle_loan", label: "Vehicle Loan", icon: CarFront },
    { value: "education_loan", label: "Education Loan", icon: GraduationCap },
    {
        value: "electronic_purchase_loan",
        label: "Electronic Purchase Loan",
        icon: Laptop,
    },
    { value: "finance_loan", label: "Finance Loan", icon: Banknote },
    { value: "others", label: "Others", icon: CircleEllipsis },
];

const getCurrentYear = () => new Date().getFullYear();

const getMonthLabel = (month) => {
    if (!month) return "—";

    return new Date(`${month}T00:00:00`).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
    });
};

const getMonthValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
};

const getPreviousMonthClosing = (snapshots, month) => {
    const previousSnapshots = snapshots
        .filter((snapshot) => snapshot.month < `${month}-01`)
        .sort((a, b) => b.month.localeCompare(a.month));

    return previousSnapshots[0]?.closing_outstanding ?? "";
};

const initialPaymentEditData = {
    paid_date: "",
    payment_type: "EMI",
    amount: "",
    principal_amount: "",
    interest_amount: "",
    balance_after_payment: "",
    payment_mode: "",
    transaction_reference: "",
    notes: "",
};

export default function MonthlyDebtUpdate({
    debts = [],
    monthlySnapshots = [],
    payments = [],
    onSave,
    onPayment,
    onUpdatePayment,
    onDeletePayment,
    paymentSaving = false,
}) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [selectedYear, setSelectedYear] = useState(String(getCurrentYear()));
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const [editingMonth, setEditingMonth] = useState(null);

    const [formData, setFormData] = useState({
        month: getMonthValue(new Date()),
        opening_outstanding: "",
        interest_rate: "",
        closing_outstanding: "",
    });

    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    // Recorded payment states
    const [expandedPaymentMonths, setExpandedPaymentMonths] = useState({});
    const [editingPaymentId, setEditingPaymentId] = useState(null);
    const [paymentEditData, setPaymentEditData] = useState({
        ...initialPaymentEditData,
    });
    const [paymentEditError, setPaymentEditError] = useState("");
    const [paymentEditSaving, setPaymentEditSaving] = useState(false);

    const categoryData = useMemo(() => {
        return DEBT_CATEGORIES.map((category) => {
            const categoryDebts = debts.filter(
                (debt) =>
                    debt.debt_type === category.value &&
                    debt.status !== "closed"
            );

            return {
                ...category,
                count: categoryDebts.length,
                debts: categoryDebts,
            };
        });
    }, [debts]);

    const debtSnapshots = useMemo(() => {
        if (!selectedDebt) return [];

        return monthlySnapshots
            .filter((snapshot) => snapshot.debt_id === selectedDebt.id)
            .sort((a, b) => b.month.localeCompare(a.month));
    }, [monthlySnapshots, selectedDebt]);

    const years = useMemo(() => {
        const availableYears = new Set(
            debtSnapshots.map((snapshot) => snapshot.month.slice(0, 4))
        );

        availableYears.add(String(getCurrentYear()));

        return [...availableYears].sort((a, b) => b.localeCompare(a));
    }, [debtSnapshots]);

    const yearlySnapshots = useMemo(() => {
        return debtSnapshots.filter(
            (snapshot) => snapshot.month.slice(0, 4) === selectedYear
        );
    }, [debtSnapshots, selectedYear]);

    const getMonthPayments = (month) => {
        return payments
            .filter((payment) => {
                return (
                    payment.debt_id === selectedDebt?.id &&
                    payment.paid_date?.slice(0, 7) === month.slice(0, 7)
                );
            })
            .sort((a, b) =>
                (b.paid_date || "").localeCompare(a.paid_date || "")
            );
    };

    const getPaymentTotal = (monthPayments) => {
        return monthPayments.reduce(
            (total, payment) => total + Number(payment.amount || 0),
            0
        );
    };

    const getPaidAfterOutstanding = (monthPayments) => {
        const latestPayment = [...monthPayments]
            .filter(
                (payment) =>
                    payment.balance_after_payment !== null &&
                    payment.balance_after_payment !== undefined
            )
            .sort((a, b) =>
                (b.paid_date || "").localeCompare(a.paid_date || "")
            )[0];

        return latestPayment?.balance_after_payment;
    };

    // =====================================
    // CATEGORY / DEBT NAVIGATION
    // =====================================

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setSelectedDebt(null);
        setEditingPaymentId(null);
    };

    const handleBackToCategories = () => {
        setSelectedCategory(null);
        setSelectedDebt(null);
        setEditingMonth(null);
        setEditingPaymentId(null);
    };

    const handleBackToDebts = () => {
        setSelectedDebt(null);
        setEditingMonth(null);
        setEditingPaymentId(null);
    };

    const handleDebtClick = (debt) => {
        setSelectedDebt(debt);
        setSelectedYear(String(getCurrentYear()));
        setEditingMonth(null);
        setEditingPaymentId(null);
        setPaymentEditError("");
    };

    // =====================================
    // MONTHLY SNAPSHOT HANDLERS
    // =====================================

    const handleAddMonth = () => {
        const month = getMonthValue(new Date());

        const previousClosing = getPreviousMonthClosing(
            debtSnapshots,
            month
        );

        setEditingMonth("new");
        setFormError("");

        setFormData({
            month,
            opening_outstanding:
                previousClosing !== "" ? String(previousClosing) : "",
            interest_rate: selectedDebt?.interest_rate ?? "",
            closing_outstanding: "",
        });
    };

    const handleEditMonth = (snapshot) => {
        setEditingMonth(snapshot.id);
        setFormError("");

        setFormData({
            month: snapshot.month.slice(0, 7),
            opening_outstanding: snapshot.opening_outstanding ?? "",
            interest_rate: snapshot.interest_rate ?? "",
            closing_outstanding: snapshot.closing_outstanding ?? "",
        });
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleCancelEdit = () => {
        setEditingMonth(null);
        setFormError("");
    };

    const handleSaveMonth = async (event) => {
        event.preventDefault();
        setFormError("");

        if (typeof onSave !== "function") {
            setFormError(
                "Save handler is not connected. Please check the container."
            );
            return;
        }

        if (!formData.month) {
            setFormError("Please select a reporting month.");
            return;
        }

        if (
            formData.opening_outstanding === "" ||
            formData.closing_outstanding === ""
        ) {
            setFormError(
                "Please enter opening and closing outstanding amounts."
            );
            return;
        }

        const opening = Number(formData.opening_outstanding);
        const closing = Number(formData.closing_outstanding);

        const interestRate =
            formData.interest_rate === ""
                ? null
                : Number(formData.interest_rate);

        if (
            !Number.isFinite(opening) ||
            !Number.isFinite(closing) ||
            opening < 0 ||
            closing < 0
        ) {
            setFormError(
                "Outstanding amounts must be valid non-negative numbers."
            );
            return;
        }

        if (
            interestRate !== null &&
            (!Number.isFinite(interestRate) || interestRate < 0)
        ) {
            setFormError("Please enter a valid interest rate.");
            return;
        }

        const payload = {
            debt_id: selectedDebt.id,
            month: `${formData.month}-01`,
            opening_outstanding: opening,
            interest_rate: interestRate,
            closing_outstanding: closing,
        };

        try {
            setSaving(true);

            await onSave(payload);

            setEditingMonth(null);
            setFormError("");
        } catch (error) {
            console.error("Monthly snapshot save failed:", error);

            setFormError(
                error?.message || "Unable to save the monthly record."
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================
    // RECORD NEW PAYMENT
    // =====================================

    const handleRecordPayment = () => {
        setIsPaymentModalOpen(true);
    };

    const handleClosePaymentModal = () => {
        if (!paymentSaving) {
            setIsPaymentModalOpen(false);
        }
    };

    const handlePaymentSubmit = async (paymentData) => {
        if (typeof onPayment !== "function") {
            throw new Error("Payment handler is not connected.");
        }

        if (!selectedDebt) {
            throw new Error("Please select a debt.");
        }

        await onPayment({
            ...paymentData,
            debt_id: selectedDebt.id,
        });

        setIsPaymentModalOpen(false);
    };

    // =====================================
    // RECORDED PAYMENT EXPANSION
    // =====================================

    const toggleMonthPayments = (month) => {
        setExpandedPaymentMonths((previous) => ({
            ...previous,
            [month]: !previous[month],
        }));
    };

    // =====================================
    // EDIT RECORDED PAYMENT
    // =====================================

    const handleStartEditPayment = (payment) => {
        setEditingPaymentId(payment.id);
        setPaymentEditError("");

        setPaymentEditData({
            paid_date: payment.paid_date || "",
            payment_type: payment.payment_type || "EMI",
            amount: payment.amount ?? "",
            principal_amount: payment.principal_amount ?? "",
            interest_amount: payment.interest_amount ?? "",
            balance_after_payment: payment.balance_after_payment ?? "",
            payment_mode: payment.payment_mode || "",
            transaction_reference: payment.transaction_reference || "",
            notes: payment.notes || "",
        });
    };

    const handlePaymentEditChange = (event) => {
        const { name, value } = event.target;

        setPaymentEditData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleCancelPaymentEdit = () => {
        setEditingPaymentId(null);
        setPaymentEditError("");
        setPaymentEditData({ ...initialPaymentEditData });
    };

    const handleSavePaymentEdit = async (paymentId) => {
        setPaymentEditError("");

        if (typeof onUpdatePayment !== "function") {
            setPaymentEditError(
                "Payment update handler is not connected. Please check the container."
            );
            return;
        }

        if (!paymentEditData.paid_date) {
            setPaymentEditError("Please select a payment date.");
            return;
        }

        const amount = Number(paymentEditData.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            setPaymentEditError("Please enter a valid payment amount.");
            return;
        }

        const optionalAmounts = [
            "principal_amount",
            "interest_amount",
            "balance_after_payment",
        ];

        for (const field of optionalAmounts) {
            const value = paymentEditData[field];

            if (
                value !== "" &&
                (!Number.isFinite(Number(value)) || Number(value) < 0)
            ) {
                setPaymentEditError(
                    "Principal, interest and balance must be valid non-negative amounts."
                );
                return;
            }
        }

        const payload = {
            paid_date: paymentEditData.paid_date,
            payment_type: paymentEditData.payment_type,
            amount,
            principal_amount:
                paymentEditData.principal_amount === ""
                    ? null
                    : Number(paymentEditData.principal_amount),
            interest_amount:
                paymentEditData.interest_amount === ""
                    ? null
                    : Number(paymentEditData.interest_amount),
            balance_after_payment:
                paymentEditData.balance_after_payment === ""
                    ? null
                    : Number(paymentEditData.balance_after_payment),
            payment_mode: paymentEditData.payment_mode.trim() || null,
            transaction_reference:
                paymentEditData.transaction_reference.trim() || null,
            notes: paymentEditData.notes.trim() || null,
        };

        try {
            setPaymentEditSaving(true);

            await onUpdatePayment({
                id: paymentId,
                updates: payload,
            });

            setEditingPaymentId(null);
            setPaymentEditData({ ...initialPaymentEditData });
            setPaymentEditError("");
        } catch (error) {
            console.error("Payment update failed:", error);

            setPaymentEditError(
                error?.message || "Unable to update payment."
            );
        } finally {
            setPaymentEditSaving(false);
        }
    };

    // =====================================
    // DELETE RECORDED PAYMENT
    // =====================================

    const handleDeleteRecordedPayment = async (payment) => {
        if (typeof onDeletePayment !== "function") {
            setPaymentEditError(
                "Payment delete handler is not connected. Please check the container."
            );
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete this payment of ${formatCurrency(
                payment.amount
            )}?`
        );

        if (!confirmed) return;

        try {
            await onDeletePayment(payment.id);

            if (editingPaymentId === payment.id) {
                handleCancelPaymentEdit();
            }

            setPaymentEditError("");
        } catch (error) {
            console.error("Payment delete failed:", error);

            setPaymentEditError(
                error?.message || "Unable to delete payment."
            );
        }
    };

    return (
        <div className="debt-page">
            <DebtPageHeader
                title="Monthly Debt Update"
                description="Manage monthly outstanding balances and payment records for your debts."
            />

            {/* =====================================
                DEBT CATEGORIES
            ===================================== */}

            {!selectedCategory && (
                <DebtSection title="Debt Categories">
                    <div className="debt-category-grid">
                        {categoryData.map((category) => (
                            <DebtCategoryCard
                                key={category.value}
                                title={category.label}
                                count={category.count}
                                icon={category.icon}
                                onClick={() => handleCategoryClick(category)}
                            />
                        ))}
                    </div>
                </DebtSection>
            )}

            {/* =====================================
                DEBTS UNDER CATEGORY
            ===================================== */}

            {selectedCategory && !selectedDebt && (
                <DebtSection title={selectedCategory.label}>
                    <button
                        type="button"
                        className="debt-navigation-back"
                        onClick={handleBackToCategories}
                    >
                        <ArrowLeft size={16} />
                        Back to Categories
                    </button>

                    {selectedCategory.debts.length === 0 ? (
                        <div className="debt-category-empty">
                            No active debts available in this category.
                        </div>
                    ) : (
                        <div className="debt-category-debt-list">
                            {selectedCategory.debts.map((debt) => (
                                <button
                                    type="button"
                                    key={debt.id}
                                    className="debt-category-debt-item"
                                    onClick={() => handleDebtClick(debt)}
                                >
                                    <div>
                                        <strong>{debt.name}</strong>
                                        <span>
                                            {debt.lender ||
                                                "No lender specified"}
                                        </span>
                                    </div>

                                    <span className="debt-category-debt-action">
                                        View Monthly Details
                                        <ArrowLeft size={16} />
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </DebtSection>
            )}

            {/* =====================================
                SELECTED DEBT DETAILS
            ===================================== */}

            {selectedDebt && (
                <>
                    <DebtSection title={selectedDebt.name}>
                        <button
                            type="button"
                            className="debt-navigation-back"
                            onClick={handleBackToDebts}
                        >
                            <ArrowLeft size={16} />
                            Back to {selectedCategory?.label}
                        </button>

                        <div className="monthly-debt-info-grid">
                            <div className="monthly-debt-info-card">
                                <span>Debt Name</span>
                                <strong>{selectedDebt.name}</strong>
                            </div>

                            <div className="monthly-debt-info-card">
                                <span>Lender</span>
                                <strong>{selectedDebt.lender || "—"}</strong>
                            </div>

                            <div className="monthly-debt-info-card">
                                <span>Debt Type</span>
                                <strong>
                                    {selectedCategory?.label || "—"}
                                </strong>
                            </div>

                            <div className="monthly-debt-info-card">
                                <span>Original Amount</span>
                                <strong>
                                    {formatCurrency(
                                        selectedDebt.original_amount
                                    )}
                                </strong>
                            </div>

                            <div className="monthly-debt-info-card">
                                <span>Interest Rate</span>
                                <strong>
                                    {selectedDebt.interest_rate ?? "—"}
                                    {selectedDebt.interest_rate != null
                                        ? "%"
                                        : ""}
                                </strong>
                            </div>

                            <div className="monthly-debt-info-card">
                                <span>Total Tenure</span>
                                <strong>
                                    {selectedDebt.tenure_months != null
                                        ? `${selectedDebt.tenure_months} months (${formatTenure(
                                            selectedDebt.tenure_months
                                        )})`
                                        : "—"}
                                </strong>
                            </div>

                            <div className="monthly-debt-info-card">
                                <span>Remaining Tenure</span>
                                <strong>
                                    {selectedDebt.remaining_tenure_months != null
                                        ? `${selectedDebt.remaining_tenure_months} months (${formatTenure(
                                            selectedDebt.remaining_tenure_months
                                        )})`
                                        : "—"}
                                </strong>
                            </div>

                            <div className="monthly-debt-info-card">
                                <span>Status</span>
                                <strong
                                    className={`monthly-debt-status ${selectedDebt.status}`}
                                >
                                    {selectedDebt.status}
                                </strong>
                            </div>
                        </div>
                    </DebtSection>

                    {/* =====================================
                        MONTHLY RECORDS
                    ===================================== */}

                    <DebtSection title="Monthly Records">
                        <div className="monthly-debt-toolbar">
                            <div className="monthly-debt-year-filter">
                                <label htmlFor="monthly-debt-year">
                                    Reporting Year
                                </label>

                                <select
                                    id="monthly-debt-year"
                                    value={selectedYear}
                                    onChange={(event) =>
                                        setSelectedYear(event.target.value)
                                    }
                                >
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="button"
                                className="monthly-debt-add-button"
                                onClick={handleAddMonth}
                            >
                                <Plus size={16} />
                                Add Month
                            </button>

                            <button
                                type="button"
                                className="monthly-debt-add-button"
                                onClick={handleRecordPayment}
                            >
                                <Plus size={16} />
                                Record Payment
                            </button>
                        </div>

                        {/* MONTHLY SNAPSHOT FORM */}

                        {editingMonth && (
                            <form
                                className="monthly-debt-edit-form"
                                onSubmit={handleSaveMonth}
                            >
                                <div className="monthly-debt-edit-header">
                                    <h3>
                                        {editingMonth === "new"
                                            ? "Add Monthly Record"
                                            : "Edit Monthly Record"}
                                    </h3>

                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        aria-label="Close form"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="monthly-debt-form-grid">
                                    <div>
                                        <label>Reporting Month</label>
                                        <input
                                            type="month"
                                            name="month"
                                            value={formData.month}
                                            onChange={handleFormChange}
                                            required
                                            disabled={editingMonth !== "new"}
                                        />
                                    </div>

                                    <div>
                                        <label>Opening Outstanding</label>
                                        <input
                                            type="number"
                                            name="opening_outstanding"
                                            min="0"
                                            step="0.01"
                                            value={formData.opening_outstanding}
                                            onChange={handleFormChange}
                                            placeholder="Enter opening amount"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label>Interest Rate (%)</label>
                                        <input
                                            type="number"
                                            name="interest_rate"
                                            min="0"
                                            step="0.01"
                                            value={formData.interest_rate}
                                            onChange={handleFormChange}
                                            placeholder="Enter interest rate"
                                        />
                                    </div>

                                    <div>
                                        <label>Closing Outstanding</label>
                                        <input
                                            type="number"
                                            name="closing_outstanding"
                                            min="0"
                                            step="0.01"
                                            value={formData.closing_outstanding}
                                            onChange={handleFormChange}
                                            placeholder="Enter bank-reported closing amount"
                                            required
                                        />
                                    </div>
                                </div>

                                {formError && (
                                    <p className="monthly-debt-form-error">
                                        {formError}
                                    </p>
                                )}

                                <div className="monthly-debt-form-actions">
                                    <button
                                        type="button"
                                        className="monthly-debt-cancel-button"
                                        onClick={handleCancelEdit}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="monthly-debt-save-button"
                                        disabled={saving}
                                    >
                                        <Save size={16} />
                                        {saving
                                            ? "Saving..."
                                            : "Save Record"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* MONTHLY RECORD CARDS */}

                        {yearlySnapshots.length === 0 ? (
                            <div className="debt-category-empty">
                                No monthly records found for {selectedYear}.
                                Use Add Month to create the first record.
                            </div>
                        ) : (
                            <div className="monthly-debt-record-list">
                                {yearlySnapshots.map((snapshot) => {
                                    const monthKey =
                                        snapshot.month.slice(0, 7);

                                    const monthPayments =
                                        getMonthPayments(snapshot.month);

                                    const paymentTotal =
                                        getPaymentTotal(monthPayments);

                                    const paidAfterOutstanding =
                                        getPaidAfterOutstanding(
                                            monthPayments
                                        );

                                    const isPaymentsExpanded =
                                        !!expandedPaymentMonths[monthKey];

                                    return (
                                        <article
                                            className="monthly-debt-record-card"
                                            key={snapshot.id}
                                        >
                                            <div className="monthly-debt-record-header">
                                                <div>
                                                    <h3>
                                                        {getMonthLabel(
                                                            snapshot.month
                                                        )}
                                                    </h3>

                                                    <span>
                                                        {monthPayments.length} payment
                                                        {monthPayments.length !== 1
                                                            ? "s"
                                                            : ""}
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="monthly-debt-edit-button"
                                                    onClick={() =>
                                                        handleEditMonth(snapshot)
                                                    }
                                                >
                                                    <Pencil size={15} />
                                                    Edit
                                                </button>
                                            </div>

                                            {/* MONTHLY AMOUNTS */}

                                            <div className="monthly-debt-record-values">
                                                <div>
                                                    <span>
                                                        Opening Outstanding
                                                    </span>

                                                    <strong>
                                                        {formatCurrency(
                                                            snapshot.opening_outstanding
                                                        )}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Total Payments</span>

                                                    <strong className="monthly-value-green">
                                                        {formatCurrency(
                                                            paymentTotal
                                                        )}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Paid After Outstanding
                                                    </span>

                                                    <strong className="monthly-value-red">
                                                        {paidAfterOutstanding != null
                                                            ? formatCurrency(
                                                                paidAfterOutstanding
                                                            )
                                                            : "—"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Closing Outstanding
                                                    </span>

                                                    <strong className="monthly-value-red">
                                                        {snapshot.closing_outstanding != null
                                                            ? formatCurrency(
                                                                snapshot.closing_outstanding
                                                            )
                                                            : "—"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Interest Rate</span>

                                                    <strong>
                                                        {snapshot.interest_rate != null
                                                            ? `${snapshot.interest_rate}%`
                                                            : "—"}
                                                    </strong>
                                                </div>
                                            </div>

                                            {/* =====================================
                                                VIEW RECORDED PAYMENTS
                                            ===================================== */}

                                            <div className="monthly-recorded-payments">
                                                <button
                                                    type="button"
                                                    className="monthly-recorded-payments-toggle"
                                                    onClick={() =>
                                                        toggleMonthPayments(
                                                            monthKey
                                                        )
                                                    }
                                                >
                                                    <span>
                                                        {isPaymentsExpanded
                                                            ? "Hide Recorded Payments"
                                                            : "View Recorded Payments"}
                                                        {" "}({monthPayments.length})
                                                    </span>

                                                    {isPaymentsExpanded ? (
                                                        <ChevronUp size={17} />
                                                    ) : (
                                                        <ChevronDown size={17} />
                                                    )}
                                                </button>

                                                {isPaymentsExpanded && (
                                                    <div className="monthly-recorded-payment-list">
                                                        {monthPayments.length === 0 ? (
                                                            <p className="monthly-no-payments">
                                                                No payments recorded
                                                                for this month.
                                                            </p>
                                                        ) : (
                                                            monthPayments.map(
                                                                (payment) => (
                                                                    <div
                                                                        className="monthly-recorded-payment-item"
                                                                        key={payment.id}
                                                                    >
                                                                        {editingPaymentId ===
                                                                            payment.id ? (
                                                                            /* EDIT PAYMENT */
                                                                            <div className="monthly-payment-edit-form">
                                                                                <div className="monthly-payment-edit-header">
                                                                                    <h4>
                                                                                        Edit Payment
                                                                                    </h4>

                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={
                                                                                            handleCancelPaymentEdit
                                                                                        }
                                                                                        disabled={
                                                                                            paymentEditSaving
                                                                                        }
                                                                                        aria-label="Close payment edit form"
                                                                                    >
                                                                                        <X
                                                                                            size={
                                                                                                17
                                                                                            }
                                                                                        />
                                                                                    </button>
                                                                                </div>

                                                                                <div className="monthly-payment-edit-grid">
                                                                                    <div>
                                                                                        <label>
                                                                                            Payment Date
                                                                                        </label>

                                                                                        <input
                                                                                            type="date"
                                                                                            name="paid_date"
                                                                                            value={
                                                                                                paymentEditData.paid_date
                                                                                            }
                                                                                            onChange={
                                                                                                handlePaymentEditChange
                                                                                            }
                                                                                        />
                                                                                    </div>

                                                                                    <div>
                                                                                        <label>
                                                                                            Payment Type
                                                                                        </label>

                                                                                        <select
                                                                                            name="payment_type"
                                                                                            value={
                                                                                                paymentEditData.payment_type
                                                                                            }
                                                                                            onChange={
                                                                                                handlePaymentEditChange
                                                                                            }
                                                                                        >
                                                                                            <option value="EMI">
                                                                                                EMI
                                                                                            </option>

                                                                                            <option value="PART_PAYMENT">
                                                                                                Part Payment
                                                                                            </option>
                                                                                        </select>
                                                                                    </div>

                                                                                    <div>
                                                                                        <label>
                                                                                            Payment Amount
                                                                                        </label>

                                                                                        <input
                                                                                            type="number"
                                                                                            name="amount"
                                                                                            min="0.01"
                                                                                            step="0.01"
                                                                                            value={
                                                                                                paymentEditData.amount
                                                                                            }
                                                                                            onChange={
                                                                                                handlePaymentEditChange
                                                                                            }
                                                                                        />
                                                                                    </div>

                                                                                    <div>
                                                                                        <label>
                                                                                            Principal Amount
                                                                                        </label>

                                                                                        <input
                                                                                            type="number"
                                                                                            name="principal_amount"
                                                                                            min="0"
                                                                                            step="0.01"
                                                                                            value={
                                                                                                paymentEditData.principal_amount
                                                                                            }
                                                                                            onChange={
                                                                                                handlePaymentEditChange
                                                                                            }
                                                                                        />
                                                                                    </div>

                                                                                    <div>
                                                                                        <label>
                                                                                            Interest Amount
                                                                                        </label>

                                                                                        <input
                                                                                            type="number"
                                                                                            name="interest_amount"
                                                                                            min="0"
                                                                                            step="0.01"
                                                                                            value={
                                                                                                paymentEditData.interest_amount
                                                                                            }
                                                                                            onChange={
                                                                                                handlePaymentEditChange
                                                                                            }
                                                                                        />
                                                                                    </div>

                                                                                    <div>
                                                                                        <label>
                                                                                            Balance After Payment
                                                                                        </label>

                                                                                        <input
                                                                                            type="number"
                                                                                            name="balance_after_payment"
                                                                                            min="0"
                                                                                            step="0.01"
                                                                                            value={
                                                                                                paymentEditData.balance_after_payment
                                                                                            }
                                                                                            onChange={
                                                                                                handlePaymentEditChange
                                                                                            }
                                                                                        />
                                                                                    </div>

                                                                                    <div>
                                                                                        <label>
                                                                                            Payment Mode
                                                                                        </label>

                                                                                        <input
                                                                                            type="text"
                                                                                            name="payment_mode"
                                                                                            value={
                                                                                                paymentEditData.payment_mode
                                                                                            }
                                                                                            onChange={
                                                                                                handlePaymentEditChange
                                                                                            }
                                                                                            placeholder="e.g. UPI, Bank Transfer"
                                                                                        />
                                                                                    </div>

                                                                                    <div>
                                                                                        <label>
                                                                                            Transaction Reference
                                                                                        </label>

                                                                                        <input
                                                                                            type="text"
                                                                                            name="transaction_reference"
                                                                                            value={
                                                                                                paymentEditData.transaction_reference
                                                                                            }
                                                                                            onChange={
                                                                                                handlePaymentEditChange
                                                                                            }
                                                                                            placeholder="Transaction reference"
                                                                                        />
                                                                                    </div>

                                                                                    <div className="monthly-payment-edit-full">
                                                                                        <label>
                                                                                            Notes
                                                                                        </label>

                                                                                        <textarea
                                                                                            name="notes"
                                                                                            rows={
                                                                                                2
                                                                                            }
                                                                                            value={
                                                                                                paymentEditData.notes
                                                                                            }
                                                                                            onChange={
                                                                                                handlePaymentEditChange
                                                                                            }
                                                                                            placeholder="Additional information"
                                                                                        />
                                                                                    </div>
                                                                                </div>

                                                                                {paymentEditError && (
                                                                                    <p className="monthly-debt-form-error">
                                                                                        {
                                                                                            paymentEditError
                                                                                        }
                                                                                    </p>
                                                                                )}

                                                                                <div className="monthly-payment-edit-actions">
                                                                                    <button
                                                                                        type="button"
                                                                                        className="monthly-debt-cancel-button"
                                                                                        onClick={
                                                                                            handleCancelPaymentEdit
                                                                                        }
                                                                                        disabled={
                                                                                            paymentEditSaving
                                                                                        }
                                                                                    >
                                                                                        Cancel
                                                                                    </button>

                                                                                    <button
                                                                                        type="button"
                                                                                        className="monthly-debt-save-button"
                                                                                        onClick={() =>
                                                                                            handleSavePaymentEdit(
                                                                                                payment.id
                                                                                            )
                                                                                        }
                                                                                        disabled={
                                                                                            paymentEditSaving
                                                                                        }
                                                                                    >
                                                                                        <Save
                                                                                            size={
                                                                                                15
                                                                                            }
                                                                                        />

                                                                                        {paymentEditSaving
                                                                                            ? "Saving..."
                                                                                            : "Update Payment"}
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            /* PAYMENT DETAILS */
                                                                            <>
                                                                                <div className="monthly-recorded-payment-header">
                                                                                    <div>
                                                                                        <h4>
                                                                                            {payment.payment_type ===
                                                                                                "PART_PAYMENT"
                                                                                                ? "Part Payment"
                                                                                                : "EMI Payment"}
                                                                                        </h4>

                                                                                        <span>
                                                                                            {payment.paid_date ||
                                                                                                "—"}
                                                                                        </span>
                                                                                    </div>

                                                                                    <div className="monthly-recorded-payment-actions">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() =>
                                                                                                handleStartEditPayment(
                                                                                                    payment
                                                                                                )
                                                                                            }
                                                                                            title="Edit payment"
                                                                                        >
                                                                                            <Pencil
                                                                                                size={
                                                                                                    15
                                                                                                }
                                                                                            />
                                                                                            Edit
                                                                                        </button>

                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() =>
                                                                                                handleDeleteRecordedPayment(
                                                                                                    payment
                                                                                                )
                                                                                            }
                                                                                            title="Delete payment"
                                                                                        >
                                                                                            <Trash2
                                                                                                size={
                                                                                                    15
                                                                                                }
                                                                                            />
                                                                                            Delete
                                                                                        </button>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="monthly-recorded-payment-details">
                                                                                    <div>
                                                                                        <span>
                                                                                            Payment Amount
                                                                                        </span>

                                                                                        <strong className="monthly-payment-amount">
                                                                                            {formatCurrency(
                                                                                                payment.amount
                                                                                            )}
                                                                                        </strong>
                                                                                    </div>

                                                                                    <div>
                                                                                        <span>
                                                                                            Principal
                                                                                        </span>

                                                                                        <strong>
                                                                                            {payment.principal_amount != null
                                                                                                ? formatCurrency(
                                                                                                    payment.principal_amount
                                                                                                )
                                                                                                : "—"}
                                                                                        </strong>
                                                                                    </div>

                                                                                    <div>
                                                                                        <span>
                                                                                            Interest
                                                                                        </span>

                                                                                        <strong>
                                                                                            {payment.interest_amount != null
                                                                                                ? formatCurrency(
                                                                                                    payment.interest_amount
                                                                                                )
                                                                                                : "—"}
                                                                                        </strong>
                                                                                    </div>

                                                                                    <div>
                                                                                        <span>
                                                                                            Balance After Payment
                                                                                        </span>

                                                                                        <strong>
                                                                                            {payment.balance_after_payment != null
                                                                                                ? formatCurrency(
                                                                                                    payment.balance_after_payment
                                                                                                )
                                                                                                : "—"}
                                                                                        </strong>
                                                                                    </div>

                                                                                    <div>
                                                                                        <span>
                                                                                            Payment Mode
                                                                                        </span>

                                                                                        <strong>
                                                                                            {payment.payment_mode ||
                                                                                                "—"}
                                                                                        </strong>
                                                                                    </div>

                                                                                    <div>
                                                                                        <span>
                                                                                            Transaction Reference
                                                                                        </span>

                                                                                        <strong>
                                                                                            {payment.transaction_reference ||
                                                                                                "—"}
                                                                                        </strong>
                                                                                    </div>

                                                                                    {payment.notes && (
                                                                                        <div className="monthly-payment-notes">
                                                                                            <span>
                                                                                                Notes
                                                                                            </span>

                                                                                            <strong>
                                                                                                {
                                                                                                    payment.notes
                                                                                                }
                                                                                            </strong>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                )
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {paymentEditError && (
                                                <p className="monthly-debt-form-error">
                                                    {paymentEditError}
                                                </p>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        )}

                        {/* RECORD PAYMENT MODAL */}

                        <DebtPaymentModal
                            isOpen={isPaymentModalOpen}
                            onClose={handleClosePaymentModal}
                            onSubmit={handlePaymentSubmit}
                            debt={selectedDebt}
                            loading={paymentSaving}
                        />
                    </DebtSection>
                </>
            )}
        </div>
    );
}
