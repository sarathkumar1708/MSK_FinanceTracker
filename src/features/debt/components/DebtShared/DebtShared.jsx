
import {
    Plus,
    Wallet,
    TrendingDown,
    CreditCard,
    IndianRupee,
} from "lucide-react";

import "./DebtShared.css";

// Format currency in Indian Rupees.
export const formatCurrency = (amount = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

// Convert tenure months into years and months.
export const formatTenure = (months) => {
    if (
        months === null ||
        months === undefined ||
        months === ""
    ) {
        return "—";
    }

    const totalMonths = Number(months);

    if (
        !Number.isInteger(totalMonths) ||
        totalMonths < 0
    ) {
        return "—";
    }

    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;

    if (years === 0) {
        return `${remainingMonths} ${remainingMonths === 1 ? "month" : "months"
            }`;
    }

    if (remainingMonths === 0) {
        return `${years} ${years === 1 ? "year" : "years"
            }`;
    }

    return `${years} ${years === 1 ? "year" : "years"
        } ${remainingMonths} ${remainingMonths === 1 ? "month" : "months"
        }`;
};

// Debt page header.
export function DebtPageHeader({
    title,
    description,
    actionLabel,
    onAction,
}) {
    return (
        <div className="debt-page-header">
            <div>
                <h1>{title}</h1>
                <p>{description}</p>
            </div>

            {actionLabel && (
                <button
                    className="primary-btn"
                    onClick={onAction}
                >
                    <Plus size={18} />
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

// Debt summary cards.
export function DebtSummaryCards({
    outstanding = 0,
    paid = 0,
    activeDebts = 0,
    payments = 0,
}) {
    const cards = [
        {
            label: "Total Outstanding",
            value: formatCurrency(outstanding),
            icon: Wallet,
        },
        {
            label: "Total Paid",
            value: formatCurrency(paid),
            icon: TrendingDown,
        },
        {
            label: "Active Debts",
            value: activeDebts,
            icon: CreditCard,
        },
        {
            label: "Total Payments",
            value: payments,
            icon: IndianRupee,
        },
    ];

    return (
        <div className="debt-summary-grid">
            {cards.map(({ label, value, icon: Icon }) => (
                <div
                    className="debt-summary-card"
                    key={label}
                >
                    <div className="debt-card-icon">
                        <Icon size={20} />
                    </div>

                    <span>{label}</span>
                    <strong>{value}</strong>
                </div>
            ))}
        </div>
    );
}

// Reusable debt section.
export function DebtSection({ title, children }) {
    return (
        <section className="debt-section">
            <h2>{title}</h2>
            {children}
        </section>
    );
}
