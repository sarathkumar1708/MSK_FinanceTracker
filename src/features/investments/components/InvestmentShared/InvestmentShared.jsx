
import {
    Plus,
    PiggyBank,
    Pencil,
    Trash2,
    LockKeyhole,
    RotateCcw,
} from "lucide-react";

import "./InvestmentShared.css";

/* =====================================================
   INVESTMENT TYPES
===================================================== */

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

/* =====================================================
   FORMAT HELPERS
===================================================== */

export const formatCurrency = (value = 0) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
};

export const formatInvestmentType = (value = "") => {
    const investmentType = INVESTMENT_TYPES.find(
        (item) => item.value === value
    );

    if (investmentType) {
        return investmentType.label;
    }

    return String(value)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
};

/* =====================================================
   PAGE HEADER
===================================================== */


export function InvestmentPageHeader({
    title,
    description,
    actionLabel,
    onAction,
    showButton,
    buttonText,
    onButtonClick,
}) {
    const finalActionLabel = actionLabel || buttonText;
    const finalOnAction = onAction || onButtonClick;

    const shouldShowButton =
        showButton !== undefined
            ? showButton
            : Boolean(finalActionLabel && finalOnAction);

    return (
        <div className="investment-page-header">
            <div className="investment-page-header-content">
                <div className="investment-page-header-icon">
                    <PiggyBank size={24} />
                </div>

                <div>
                    <h1>{title}</h1>
                    {description && <p>{description}</p>}
                </div>
            </div>

            {shouldShowButton && finalActionLabel && finalOnAction && (
                <button
                    type="button"
                    className="investment-primary-btn"
                    onClick={finalOnAction}
                >
                    <Plus size={18} />
                    <span>{finalActionLabel}</span>
                </button>
            )}
        </div>
    );
}


/* =====================================================
   SECTION
===================================================== */

export function InvestmentSection({
    title,
    description,
    children,
    className = "",
}) {
    return (
        <section className={`investment-section ${className}`.trim()}>
            {(title || description) && (
                <div className="investment-section-header">
                    <div>
                        {title && <h2>{title}</h2>}
                        {description && <p>{description}</p>}
                    </div>
                </div>
            )}

            <div className="investment-section-content">
                {children}
            </div>
        </section>
    );
}

/* =====================================================
   INVESTMENT CARD
===================================================== */

export function InvestmentCard({
    investment,
    currentValue = 0,
    totalInvested = 0,
    totalWithdrawals = 0,
    onEdit,
    onDelete,
    onClose,
    onActivate,
}) {
    if (!investment) return null;

    const isClosed =
        String(investment.status || "").toLowerCase() === "closed";

    const investmentName = investment.name || "Untitled Investment";

    const investmentType = formatInvestmentType(
        investment.investment_type
    );

    const provider =
        investment.provider ||
        investment.platform ||
        investment.institution ||
        "—";

    const startDate = investment.start_date
        ? new Date(`${investment.start_date}T00:00:00`).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        )
        : "—";

    return (
        <div className={`investment-card ${isClosed ? "closed" : "active"}`}>
            <div className="investment-card-header">
                <div className="investment-card-icon">
                    <PiggyBank size={22} />
                </div>

                <div className="investment-card-title">
                    <h3>{investmentName}</h3>
                    <span>{investmentType}</span>
                </div>

                <span
                    className={`investment-status ${isClosed ? "closed" : "active"
                        }`}
                >
                    {isClosed ? "Closed" : "Active"}
                </span>
            </div>

            <div className="investment-card-values">
                <div className="current-value">
                    <span>Current Value</span>
                    <strong>{formatCurrency(currentValue)}</strong>
                </div>

                <div>
                    <span>Total Invested</span>
                    <strong>{formatCurrency(totalInvested)}</strong>
                </div>

                <div>
                    <span>Profit</span>
                    <strong className={(currentValue - totalInvested) > 0 ? "current-value" : "withdrawal-value"}>
                        {formatCurrency(currentValue - totalInvested)}
                    </strong>
                </div>

                <div>
                    <span>Total Withdrawals</span>
                    <strong>{formatCurrency(totalWithdrawals)}</strong>
                </div>

            </div>

            <div className="investment-card-detail">
                <div>
                    <span>{`Provider :`}</span>
                    <strong>{provider}</strong>
                </div>

                <div>
                    <span>{`Start Date :`}</span>
                    <strong>{startDate}</strong>
                </div>
            </div>

            <div className="investment-card-actions">
                {onEdit && (
                    <button
                        type="button"
                        onClick={() => onEdit(investment)}
                        title="Edit investment"
                    >
                        <Pencil size={15} />
                        <span>Edit</span>
                    </button>
                )}

                {!isClosed && onClose && (
                    <button
                        type="button"
                        onClick={() => onClose(investment)}
                        title="Close investment"
                    >
                        <LockKeyhole size={15} />
                        <span>Close</span>
                    </button>
                )}

                {isClosed && onActivate && (
                    <button
                        type="button"
                        onClick={() => onActivate(investment)}
                        title="Move investment back to active"
                    >
                        <RotateCcw size={15} />
                        <span>Move to Active</span>
                    </button>
                )}

                {onDelete && (
                    <button
                        type="button"
                        className="delete-action"
                        onClick={() => onDelete(investment)}
                        title="Permanently delete investment"
                    >
                        <Trash2 size={15} />
                        <span>Delete</span>
                    </button>
                )}
            </div>
        </div>
    );
}
