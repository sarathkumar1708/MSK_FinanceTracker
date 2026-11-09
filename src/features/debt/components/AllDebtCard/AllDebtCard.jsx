
import { Pencil, Trash2, CalendarDays, Wallet, CheckCircle } from "lucide-react";
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

const Metric = ({ label, value, color = "", format = "currency" }) => (
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

    console.log("Debt : ", debt)

    return (
        <article className="debt-card">
            <div className="debt-card-header">
                <div className="debt-card-title">
                    <div className="debt-card-icon">
                        <Wallet size={21} />
                    </div>

                    <div>
                        <h3>{debt.name}</h3>
                        <p>{debt.lender || "No lender specified"}</p>
                    </div>
                </div>

                <span className={`debt-card-status ${isClosed ? "closed" : "active"}`}>
                    {isClosed ? "Closed" : "Pending"}
                </span>
            </div>

            <div className="debt-card-type">
                {formatDebtType(debt.debt_type)}
            </div>
            {/* 
            <div className="debt-card-loan-amount">
                <span>Original Loan Amount</span>
                <strong>{formatCurrency(debt.original_amount)}</strong>
            </div> */}


            <div className="debt-card-loan-amount">
                <span>Current Outstanding</span>
                <strong>{formatCurrency(currentOutstanding > 0 ? currentOutstanding : debt.original_amount)}</strong>
            </div>

            <div className="debt-card-metrics">
                <Metric
                    label="Original Loan Amount"
                    value={debt.original_amount}
                    color="metric-blue"
                />

                <Metric
                    label="Total Principal Paid"
                    value={totalPrincipalPaid}
                    color="metric-blue"
                />

                <Metric
                    label="Total Interest Paid"
                    value={totalInterestPaid}
                    color="metric-red"
                />

                {/* <Metric
                    label="Total EMI Paid"
                    value={totalEmiPaid}
                    color="metric-green"
                /> */}

                <Metric
                    label="Total Repayment"
                    value={totalRepayment}
                    color="metric-purple"
                />
                <Metric
                    label="Interest Rate"
                    value={debt.interest_rate}
                    format="percent"
                />


                <div className="debt-card-metric">
                    <span>Start Date</span>
                    <strong>{formatDate(debt.start_date)}</strong>
                </div>

                <div className="debt-card-metric">
                    <span>Total Tenure's</span>
                    <strong>{debt.tenure_months ? debt.tenure_months : 0}</strong>
                </div>

                <div className="debt-card-metric">
                    <span>Remaining Tenure's</span>
                    <strong>{debt.remaining_tenure_months ? debt.remaining_tenure_months : 0}</strong>
                </div>

            </div>

            <div className="debt-card-footer">
                <div className="debt-card-created">
                    <CalendarDays size={15} />
                    <span>Created {formatDate(debt.created_at)}</span>
                </div>

                <div className="debt-card-actions">
                    <button
                        type="button"
                        className="debt-card-edit"
                        onClick={() => onEdit(debt)}
                    >
                        <Pencil size={15} />
                        Edit
                    </button>

                    <button
                        type="button"
                        className="debt-card-delete"
                        onClick={() => onDelete(debt)}
                    >
                        <Trash2 size={15} />
                        Delete
                    </button>

                    {debt.status !== "closed" && (
                        <button
                            type="button"
                            className="debt-action-btn close-btn"
                            onClick={() => onClose(debt)}
                        >
                            <CheckCircle size={15} />
                            Close
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
