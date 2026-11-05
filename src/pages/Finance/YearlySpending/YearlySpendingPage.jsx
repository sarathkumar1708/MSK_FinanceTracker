
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../../components/common/PageHeader";
import { transactionService } from "../../../services/transactionService";
import "./YearlySpendingPage.css";

function formatTotal(amount) {
    return Number(amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function getTransactionAmount(transaction) {
    if (transaction.amount !== undefined && transaction.amount !== null) {
        return Number(transaction.amount) || 0;
    }

    return (Number(transaction.amount_minor) || 0) / 100;
}

function getYearRange(year) {
    return {
        startDate: `${year}-01-01`,
        endDate: `${Number(year) + 1}-01-01`,
    };
}

function YearlySpendingPage() {
    const currentYear = new Date().getFullYear();

    const [selectedYear, setSelectedYear] = useState(
        String(currentYear)
    );

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Display multiple years, including the selected year.
    const years = useMemo(
        () =>
            Array.from(
                { length: currentYear - 2000 + 3 },
                (_, index) => currentYear + 2 - index
            ),
        [currentYear]
    );

    // Fetch transactions for the selected year.
    useEffect(() => {
        let active = true;

        const loadTransactions = async () => {
            try {
                setLoading(true);
                setError("");
                setTransactions([]);

                const { startDate, endDate } = getYearRange(selectedYear);

                const data = await transactionService.getAll({
                    startDate,
                    endDate,
                });

                if (active) {
                    setTransactions(data);
                }
            } catch (err) {
                console.error("Failed to fetch yearly transactions:", err);

                if (active) {
                    setError(
                        err.message || "Unable to load yearly transactions."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadTransactions();

        return () => {
            active = false;
        };
    }, [selectedYear]);

    // Calculate yearly totals.
    const yearlySummary = useMemo(() => {
        const summary = transactions.reduce(
            (result, transaction) => {
                const amount = getTransactionAmount(transaction);

                if (transaction.type === "income") {
                    result.totalIncome += amount;
                } else if (transaction.type === "expense") {
                    result.totalExpense += amount;
                }

                result.transactionCount += 1;

                return result;
            },
            {
                totalIncome: 0,
                totalExpense: 0,
                transactionCount: 0,
            }
        );

        return {
            ...summary,
            totalBalance: summary.totalIncome - summary.totalExpense,
        };
    }, [transactions]);

    const balanceTone =
        yearlySummary.totalBalance > 0
            ? "positive"
            : yearlySummary.totalBalance < 0
                ? "negative"
                : "neutral";

    // Calculate monthly totals for the selected year.
    const monthlyBreakdown = useMemo(() => {
        const months = Array.from({ length: 12 }, (_, index) => ({
            monthNumber: String(index + 1).padStart(2, "0"),
            monthName: new Date(
                Number(selectedYear),
                index,
                1
            ).toLocaleString("en-IN", { month: "long" }),
            income: 0,
            expense: 0,
        }));

        transactions.forEach((transaction) => {
            const date =
                transaction.date || transaction.transaction_date;

            if (!date || date.slice(0, 4) !== selectedYear) return;

            const monthNumber = date.slice(5, 7);

            const month = months.find(
                (item) => item.monthNumber === monthNumber
            );

            if (!month) return;

            const amount = getTransactionAmount(transaction);

            if (transaction.type === "income") {
                month.income += amount;
            } else if (transaction.type === "expense") {
                month.expense += amount;
            }
        });

        return months.map((month) => ({
            ...month,
            balance: month.income - month.expense,
        }));
    }, [transactions, selectedYear]);

    return (
        <div className="page-container yearly-spending-page">
            <PageHeader
                title="Yearly Spending"
                description="Track and compare your yearly income and expenses."
                icon="CalendarRange"
            />

            <div className="content-card yearly-spending-card">

                {/* Year Selection */}
                <div className="yearly-spending-toolbar">
                    <div className="year-selector">
                        <label htmlFor="yearly-spending-year">
                            Select Year
                        </label>

                        <select
                            id="yearly-spending-year"
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
                        className="year-reset-button"
                        onClick={() => setSelectedYear(String(currentYear))}
                        disabled={selectedYear === String(currentYear)}
                    >
                        Current Year
                    </button>
                </div>

                {/* Yearly Summary */}
                {loading ? (
                    <div className="yearly-loading">
                        Loading yearly transactions...
                    </div>
                ) : error ? (
                    <div className="error-message" role="alert">
                        {error}
                        <button
                            type="button"
                            onClick={() => setSelectedYear((year) => String(Number(year) + 1))}
                        >
                            Try again
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="yearly-overview-header">
                            <div>
                                <h3>{selectedYear} Financial Overview</h3>
                                <p>January - December {selectedYear}</p>
                            </div>

                            <span className="yearly-transaction-badge">
                                {yearlySummary.transactionCount} Transactions
                            </span>
                        </div>

                        <div className="yearly-overview-grid">
                            <div className="yearly-overview-card income">
                                <span>Total Income</span>
                                <strong>
                                    ₹{formatTotal(yearlySummary.totalIncome)}
                                </strong>
                            </div>

                            <div className="yearly-overview-card expense">
                                <span>Total Expense</span>
                                <strong>
                                    ₹{formatTotal(yearlySummary.totalExpense)}
                                </strong>
                            </div>

                            <div className={`yearly-overview-card balance ${balanceTone}`}>
                                <span>Net Balance</span>
                                <strong>
                                    ₹{formatTotal(yearlySummary.totalBalance)}
                                </strong>
                            </div>

                            <div className="yearly-overview-card count">
                                <span>Transaction Count</span>
                                <strong>{yearlySummary.transactionCount}</strong>
                            </div>
                        </div>

                        {/* Income and Expense Comparison */}
                        <div className="yearly-comparison">
                            <h3>Income vs Expense</h3>

                            <div className="comparison-item">
                                <div className="comparison-label">
                                    <span>Income</span>
                                    <strong>
                                        ₹{formatTotal(yearlySummary.totalIncome)}
                                    </strong>
                                </div>

                                <div className="comparison-track">
                                    <div
                                        className="comparison-fill income-fill"
                                        style={{
                                            width: `${yearlySummary.totalIncome +
                                                yearlySummary.totalExpense > 0
                                                ? (yearlySummary.totalIncome /
                                                    (yearlySummary.totalIncome +
                                                        yearlySummary.totalExpense)) *
                                                100
                                                : 0
                                                }%`,
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="comparison-item">
                                <div className="comparison-label">
                                    <span>Expense</span>
                                    <strong>
                                        ₹{formatTotal(yearlySummary.totalExpense)}
                                    </strong>
                                </div>

                                <div className="comparison-track">
                                    <div
                                        className="comparison-fill expense-fill"
                                        style={{
                                            width: `${yearlySummary.totalIncome +
                                                yearlySummary.totalExpense > 0
                                                ? (yearlySummary.totalExpense /
                                                    (yearlySummary.totalIncome +
                                                        yearlySummary.totalExpense)) *
                                                100
                                                : 0
                                                }%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Monthly Breakdown */}
                        <div className="yearly-monthly-section">
                            <div className="yearly-section-header">
                                <h3>Monthly Breakdown</h3>
                                <span>{selectedYear}</span>
                            </div>

                            <div className="yearly-monthly-table-wrapper">
                                <table className="yearly-monthly-table">
                                    <thead>
                                        <tr>
                                            <th>Month</th>
                                            <th>Income</th>
                                            <th>Expense</th>
                                            <th>Balance</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {monthlyBreakdown.map((month) => (
                                            <tr key={month.monthNumber}>
                                                <td>{month.monthName}</td>

                                                <td className="income-text">
                                                    ₹{formatTotal(month.income)}
                                                </td>

                                                <td className="expense-text">
                                                    ₹{formatTotal(month.expense)}
                                                </td>

                                                <td
                                                    className={
                                                        month.balance > 0
                                                            ? "positive"
                                                            : month.balance < 0
                                                                ? "negative"
                                                                : "neutral"
                                                    }
                                                >
                                                    ₹{formatTotal(month.balance)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default YearlySpendingPage;
