
import { Plus, PiggyBank } from "lucide-react";
import "./InvestmentShared.css";

export const INVESTMENT_TYPES = [
    "Jwell",
    "Stocks",
    "Mutual Fund",
    "Nagaseetu",
    "Seetu",
    "Undiyal",
    "PPF",
    "Pension Scheme",
    "Selvamagal Semipu Thittam",
    "Monthly Investment Scheme",
    "Fixed Deposit",
    "Recurring Deposit",
    "Festivals / Cloths",
    "Wedding / Birthday",
    "Emergency Fund",
    "Medical Savings",
    "Venduthal",
    "Relations Events / Moi",
    "Others",
];

export const formatCurrency = (amount = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

export const formatInvestmentType = (type = "") =>
    type.replaceAll("_", " ");

export function InvestmentPageHeader({
    title,
    description,
    buttonText,
    onButtonClick,
    showButton = true,
}) {
    return (
        <div className="investment-page-header">
            <div>
                <h2>{title}</h2>
                <p>{description}</p>
            </div>

            {showButton && (
                <button
                    type="button"
                    className="investment-primary-btn"
                    onClick={onButtonClick}
                >
                    <Plus size={18} />
                    {buttonText || "Add Investment"}
                </button>
            )}
        </div>
    );
}

export function InvestmentSection({
    title,
    description,
    children,
    action,
}) {
    return (
        <section className="investment-section">
            <div className="investment-section-header">
                <div>
                    <h3>{title}</h3>
                    {description && <p>{description}</p>}
                </div>
                {action}
            </div>

            {children}
        </section>
    );
}

export function InvestmentCard({
    investment,
    currentValue = 0,
    totalInvested = 0,
    totalWithdrawals = 0,
    onEdit,
    onDelete,
    onClose,
}) {
    const isClosed = investment.status === "closed";

    return (
        <div className="investment-card">
            <div className="investment-card-header">
                <div className="investment-card-icon">
                    <PiggyBank size={22} />
                </div>

                <div className="investment-card-title">
                    <h3>{investment.name}</h3>
                    <span>
                        {formatInvestmentType(investment.investment_type)}
                    </span>
                </div>

                <span
                    className={`investment-status ${isClosed ? "closed" : "active"
                        }`}
                >
                    {isClosed ? "Closed" : "Active"}
                </span>
            </div>

            <div className="investment-card-values">
                <div>
                    <span>Total Invested</span>
                    <strong>{formatCurrency(totalInvested)}</strong>
                </div>

                <div>
                    <span>Current Value</span>
                    <strong className="current-value">
                        {formatCurrency(currentValue)}
                    </strong>
                </div>

                <div>
                    <span>Total Withdrawals</span>
                    <strong className="withdrawal-value">
                        {formatCurrency(totalWithdrawals)}
                    </strong>
                </div>
            </div>

            {investment.provider && (
                <div className="investment-card-detail">
                    <span>Provider</span>
                    <strong>{investment.provider}</strong>
                </div>
            )}

            {investment.start_date && (
                <div className="investment-card-detail">
                    <span>Start Date</span>
                    <strong>
                        {new Date(investment.start_date).toLocaleDateString(
                            "en-IN"
                        )}
                    </strong>
                </div>
            )}

            <div className="investment-card-actions">
                <button type="button" onClick={onEdit}>
                    Edit
                </button>

                {!isClosed && (
                    <button type="button" onClick={onClose}>
                        Close Investment
                    </button>
                )}

                <button
                    type="button"
                    className="delete-action"
                    onClick={onDelete}
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
