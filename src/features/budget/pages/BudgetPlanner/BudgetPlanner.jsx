
import { useMemo } from "react";
import {
    ArrowRight,
    ArrowUpRight,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    IndianRupee,
    PiggyBank,
    Wallet,
} from "lucide-react";

import "./BudgetPlanner.css";

/* =====================================================
   CONSTANTS
===================================================== */

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

/* =====================================================
   HELPERS
===================================================== */

const formatCurrency = (amount = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

/* =====================================================
   MONTH SUMMARY
===================================================== */

const getMonthSummary = (monthId, incomes, budgetItems) => {
    const monthIncomes = incomes.filter(
        (item) => item.budget_month_id === monthId
    );

    const monthBudgets = budgetItems.filter(
        (item) => item.budget_month_id === monthId
    );

    const totalIncome = monthIncomes.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    const plannedBudget = monthBudgets.reduce(
        (sum, item) => sum + Number(item.planned_amount || 0),
        0
    );

    return {
        totalIncome,
        plannedBudget,
        balance: totalIncome - plannedBudget,
        budgetCount: monthBudgets.length,
    };
};

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function BudgetPlanner({
    year,
    onChangeYear,
    months = [],
    incomes = [],
    budgetItems = [],
    loading,
    error,
    onOpenMonth,
}) {
    /* ---------------------------------------------
       MONTH RECORD LOOKUP
    --------------------------------------------- */

    const monthRecords = useMemo(() => {
        const records = {};

        months.forEach((month) => {
            records[month.budget_month] = month;
        });

        return records;
    }, [months]);

    /* ---------------------------------------------
       MONTHLY SUMMARIES
    --------------------------------------------- */

    const summaries = useMemo(
        () =>
            MONTHS.map((monthName, index) => {
                const monthNumber = index + 1;
                const monthRecord = monthRecords[monthNumber];

                const summary = monthRecord
                    ? getMonthSummary(
                        monthRecord.id,
                        incomes,
                        budgetItems
                    )
                    : getMonthSummary(null, [], []);

                return {
                    monthNumber,
                    monthName,
                    monthRecord,
                    ...summary,
                };
            }),
        [monthRecords, incomes, budgetItems]
    );

    /* ---------------------------------------------
       YEAR SUMMARY
    --------------------------------------------- */

    const yearSummary = useMemo(
        () =>
            summaries.reduce(
                (total, month) => ({
                    totalIncome:
                        total.totalIncome + month.totalIncome,

                    plannedBudget:
                        total.plannedBudget + month.plannedBudget,

                    balance:
                        total.balance + month.balance,
                }),
                {
                    totalIncome: 0,
                    plannedBudget: 0,
                    balance: 0,
                }
            ),
        [summaries]
    );

    /* =================================================
       RENDER
    ================================================= */

    return (
        <div className="budget-planner-page">

            {/* PAGE HEADER */}

            <div className="budget-planner-header">

                <div className="budget-planner-heading">

                    <div className="budget-planner-heading-icon">
                        <PiggyBank size={25} />
                    </div>

                    <div>
                        <span className="budget-planner-eyebrow">
                            FINANCIAL PLANNING
                        </span>

                        <h1>Budget Planner</h1>

                        <p>
                            Plan your income, manage monthly budgets
                            and monitor your available balance.
                        </p>
                    </div>

                </div>

                {/* YEAR SELECTOR */}

                <div className="budget-year-selector">

                    <button
                        type="button"
                        onClick={() => onChangeYear(-1)}
                        aria-label="Previous year"
                    >
                        <ChevronLeft size={19} />
                    </button>

                    <div className="budget-year-value">
                        <CalendarDays size={17} />
                        <span>{year}</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => onChangeYear(1)}
                        aria-label="Next year"
                    >
                        <ChevronRight size={19} />
                    </button>

                </div>

            </div>

            {/* YEAR SUMMARY */}

            <section className="budget-year-summary">

                <div className="budget-year-summary-heading">

                    <div>
                        <span className="budget-section-kicker">
                            YEAR AT A GLANCE
                        </span>

                        <h2>{year} Financial Summary</h2>
                    </div>

                    <span className="budget-summary-period">
                        January – December {year}
                    </span>

                </div>

                <div className="budget-year-summary-grid">

                    <SummaryCard
                        icon={<Wallet size={19} />}
                        label="Total Income"
                        amount={yearSummary.totalIncome}
                        tone="blue"
                    />

                    <SummaryCard
                        icon={<PiggyBank size={19} />}
                        label="Planned Budget"
                        amount={yearSummary.plannedBudget}
                        tone="purple"
                    />

                    <SummaryCard
                        icon={<ArrowUpRight size={19} />}
                        label="Balance"
                        amount={yearSummary.balance}
                        tone="green"
                    />

                </div>

            </section>

            {/* MONTHLY BREAKDOWN */}

            <section className="budget-months-section">

                <div className="budget-months-heading">

                    <div>
                        <span className="budget-section-kicker">
                            MONTHLY BREAKDOWN
                        </span>

                        <h2>Monthly Budgets</h2>

                        <p>
                            Select a month to manage income and planned expenses.
                        </p>
                    </div>

                    <span className="budget-month-count">
                        12 MONTHS
                    </span>

                </div>

                {/* ERROR */}

                {error && (
                    <div className="budget-error-message">
                        {error}
                    </div>
                )}

                {/* LOADING */}

                {loading ? (
                    <div className="budget-loading">
                        <div className="budget-spinner" />

                        <span>
                            Loading your yearly budget...
                        </span>
                    </div>
                ) : (

                    /* MONTH CARDS */

                    <div className="budget-month-grid">

                        {summaries.map((month) => (

                            <button
                                type="button"
                                className="budget-month-card"
                                key={month.monthNumber}
                                onClick={() =>
                                    onOpenMonth(month.monthNumber)
                                }
                            >

                                <div className="budget-month-card-top">

                                    <div className="budget-month-icon">
                                        <CalendarDays size={19} />
                                    </div>

                                    <span className="budget-month-open">
                                        <ArrowRight size={17} />
                                    </span>

                                </div>

                                <h3>{month.monthName}</h3>

                                {/* MONTHLY TOTALS */}

                                <div className="budget-month-card-stats">

                                    <div className="budget-month-stat">
                                        <span>Total Income</span>

                                        <strong className="income-value">
                                            {formatCurrency(
                                                month.totalIncome
                                            )}
                                        </strong>
                                    </div>

                                    <div className="budget-month-stat">
                                        <span>Planned Budget</span>

                                        <strong className="expense-value">
                                            {formatCurrency(
                                                month.plannedBudget
                                            )}
                                        </strong>
                                    </div>

                                </div>

                                {/* BALANCE */}

                                <div className="budget-month-card-footer">

                                    <div>
                                        <span>Balance</span>

                                        <strong
                                            className={
                                                month.balance < 0
                                                    ? "negative-value"
                                                    : "positive-value"
                                            }
                                        >
                                            {formatCurrency(month.balance)}
                                        </strong>
                                    </div>

                                    <span className="budget-entry-count">
                                        {month.budgetCount} budget items
                                    </span>

                                </div>

                            </button>

                        ))}

                    </div>
                )}

            </section>

        </div>
    );
}

/* =====================================================
   SUMMARY CARD
===================================================== */

function SummaryCard({ icon, label, amount, tone }) {
    return (
        <div className={`budget-summary-card ${tone}`}>

            <div className="budget-summary-card-top">

                <span className="budget-summary-icon">
                    {icon}
                </span>

                <span className="budget-summary-label">
                    {label}
                </span>

            </div>

            <strong className="budget-summary-amount">
                {formatCurrency(amount)}
            </strong>

        </div>
    );
}
