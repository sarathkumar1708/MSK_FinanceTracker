
import {
    Pencil,
    Trash2,
    CalendarDays,
    Wallet,
    CheckCircle,
} from "lucide-react";

import { formatCurrency } from "../DebtShared/DebtShared";
import "./AllDebtCard.css";

const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatDebtType = (type = "") =>
    type
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

const Metric = ({
    label,
    value,
    color = "",
    format = "currency",
}) => (
    <div className="debt-card-metric">
        <span>{label}</span>

        <strong className={color}>
            {value == null
                ? "—"
                : format === "percent"
                    ? `${value}%`
                    : formatCurrency(value)}
        </strong>
    </div>
);

export default function AllDebtCard({
    debt,
    currentOutstanding,
    totalPrincipalPaid,
    totalInterestPaid,
    totalEmiPaid,
    totalRepayment,
    onEdit,
    onDelete,
    onClose,
}) {
    const isClosed = debt.status === "closed";

    return (
        <article className={`debt-card ${isClosed ? "debt-card-closed" : ""}`}>

            {/* HEADER */}
            <div className="debt-card-header">
                <div className="debt-card-title">
                    <div className="debt-card-icon">
                        <Wallet size={21} strokeWidth={2.2} />
                    </div>

                    <div className="debt-card-heading">
                        <h3 title={debt.name}>{debt.name}</h3>
                        <p title={debt.lender}>
                            {debt.lender || "No lender specified"}
                        </p>
                    </div>
                </div>

                <span
                    className={`debt-card-status ${isClosed ? "closed" : "active"
                        }`}
                >
                    {isClosed ? "Closed" : "Active"}
                </span>
            </div>

            {/* DEBT TYPE */}
            <div className="debt-card-type">
                {formatDebtType(debt.debt_type)}
            </div>

            {/* OUTSTANDING AMOUNTS */}
            <div className="card-outstanding-amount-wrap">

                <div className="debt-card-loan-amount original-amount">
                    <div className="debt-amount-label">
                        <span className="debt-amount-dot blue-dot" />
                        Original Loan Amount
                    </div>

                    <strong>
                        {formatCurrency(debt.original_amount)}
                    </strong>
                </div>

                <div className="debt-card-loan-amount outstanding-amount">
                    <div className="debt-amount-label">
                        <span className="debt-amount-dot red-dot" />
                        Current Outstanding
                    </div>

                    <strong>
                        {formatCurrency(
                            currentOutstanding > 0
                                ? currentOutstanding
                                : debt.original_amount
                        )}
                    </strong>
                </div>

            </div>

            {/* FINANCIAL METRICS */}
            <div className="debt-card-section-heading">
                Financial Overview
            </div>

            <div className="debt-card-metrics">

                <Metric
                    label="Principal Paid"
                    value={totalPrincipalPaid}
                    color="metric-blue"
                />

                <Metric
                    label="Interest Paid"
                    value={totalInterestPaid}
                    color="metric-red"
                />

                <Metric
                    label="Total Repayment"
                    value={totalRepayment}
                    color="metric-purple"
                />

                <Metric
                    label="Interest Rate"
                    value={debt.interest_rate}
                    format="percent"
                    color="metric-orange"
                />

                <Metric
                    label="Monthly EMI"
                    value={debt.monthly_emi}
                    color="metric-green"
                />

                <div className="debt-card-metric">
                    <span>Start Date</span>
                    <strong>{formatDate(debt.start_date)}</strong>
                </div>

                <div className="debt-card-metric">
                    <span>Total Tenure</span>
                    <strong>
                        {debt.tenure_months ?? 0} Months
                    </strong>
                </div>

                <div className="debt-card-metric">
                    <span>Remaining Tenure</span>
                    <strong className="metric-purple">
                        {debt.remaining_tenure_months ?? 0} Months
                    </strong>
                </div>

            </div>

            {/* FOOTER */}
            <div className="debt-card-footer">

                <div className="debt-card-created">
                    <CalendarDays size={15} />
                    <span>
                        Created {formatDate(debt.created_at)}
                    </span>
                </div>

                <div className="debt-card-actions">

                    <button
                        type="button"
                        className="debt-card-edit"
                        onClick={() => onEdit(debt)}
                    >
                        <Pencil size={14} />
                        Edit
                    </button>

                    <button
                        type="button"
                        className="debt-card-delete"
                        onClick={() => onDelete(debt)}
                    >
                        <Trash2 size={14} />
                        Delete
                    </button>

                    {!isClosed && (
                        <button
                            type="button"
                            className="debt-action-btn close-btn"
                            onClick={() => onClose(debt)}
                        >
                            <CheckCircle size={14} />
                            Close
                        </button>
                    )}

                </div>
            </div>

        </article>
    );
}
