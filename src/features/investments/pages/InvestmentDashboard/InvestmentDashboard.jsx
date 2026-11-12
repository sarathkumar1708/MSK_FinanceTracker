
import { useMemo, useState } from "react";
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    ArrowLeftRight,
    PiggyBank,
} from "lucide-react";

import {
    InvestmentPageHeader,
    InvestmentSection,
    formatCurrency,
} from "../../components/InvestmentShared/InvestmentShared";

import "./InvestmentDashboard.css";

const MONTHS = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December",
];

export default function InvestmentDashboard({
    investments = [],
    transactions = [],
    monthlySnapshots = [],
    loading = false,
}) {
    const currentYear = new Date().getFullYear();

    const [selectedYear, setSelectedYear] = useState(String(currentYear));
    const [selectedMonth, setSelectedMonth] = useState("all");
    const [selectedInvestment, setSelectedInvestment] = useState("all");

    // Only active investments are included in dashboard calculations.
    const activeInvestments = useMemo(
        () => investments.filter(
            (item) => String(item.status || "").toLowerCase() === "active"
        ),
        [investments]
    );

    const activeInvestmentIds = useMemo(
        () => new Set(activeInvestments.map((item) => item.id)),
        [activeInvestments]
    );

    const activeTransactions = useMemo(
        () => transactions.filter(
            (item) => activeInvestmentIds.has(item.investment_id)
        ),
        [transactions, activeInvestmentIds]
    );

    const activeSnapshots = useMemo(
        () => monthlySnapshots.filter(
            (item) => activeInvestmentIds.has(item.investment_id)
        ),
        [monthlySnapshots, activeInvestmentIds]
    );

    // Keep the selected investment valid if it is closed or deleted.
    const validSelectedInvestment =
        selectedInvestment === "all" ||
        activeInvestmentIds.has(selectedInvestment);

    const effectiveSelectedInvestment = validSelectedInvestment
        ? selectedInvestment
        : "all";

    const years = useMemo(() => {
        const values = new Set([currentYear]);

        activeTransactions.forEach((item) => {
            if (item.transaction_date) {
                values.add(Number(item.transaction_date.slice(0, 4)));
            }
        });

        activeSnapshots.forEach((item) => {
            if (item.month) {
                values.add(Number(item.month.slice(0, 4)));
            }
        });

        return [...values].sort((a, b) => b - a);
    }, [activeTransactions, activeSnapshots, currentYear]);

    // Last date included in the selected reporting period.
    const periodEnd = useMemo(() => {
        if (selectedMonth !== "all") {
            const year = Number(selectedYear);
            const month = Number(selectedMonth);

            const lastDay = new Date(year, month, 0).getDate();

            return [
                year,
                String(month).padStart(2, "0"),
                String(lastDay).padStart(2, "0"),
            ].join("-");
        }

        return `${selectedYear}-12-31`;
    }, [selectedYear, selectedMonth]);

    const periodTransactions = useMemo(() => {
        return activeTransactions.filter((item) => {
            const date = item.transaction_date || "";

            const matchesYear = date.slice(0, 4) === selectedYear;

            const matchesMonth =
                selectedMonth === "all" ||
                date.slice(5, 7) === selectedMonth;

            const matchesInvestment =
                effectiveSelectedInvestment === "all" ||
                item.investment_id === effectiveSelectedInvestment;

            return matchesYear && matchesMonth && matchesInvestment;
        });
    }, [
        activeTransactions,
        selectedYear,
        selectedMonth,
        effectiveSelectedInvestment,
    ]);

    const summary = useMemo(() => {
        const contributions = periodTransactions
            .filter((item) => item.transaction_type === "CONTRIBUTION")
            .reduce((sum, item) => sum + Number(item.amount || 0), 0);

        const withdrawals = periodTransactions
            .filter((item) => item.transaction_type === "WITHDRAWAL")
            .reduce((sum, item) => sum + Number(item.amount || 0), 0);

        return {
            contributions,
            withdrawals,
            netInvested: contributions - withdrawals,
            transactionCount: periodTransactions.length,
        };
    }, [periodTransactions]);

    // Calculate the latest known value for each active investment
    // as of the selected reporting period.
    const investmentValues = useMemo(() => {
        const selectedInvestments =
            effectiveSelectedInvestment === "all"
                ? activeInvestments
                : activeInvestments.filter(
                    (item) => item.id === effectiveSelectedInvestment
                );

        return selectedInvestments.map((investment) => {
            const snapshots = activeSnapshots
                .filter(
                    (item) =>
                        item.investment_id === investment.id &&
                        item.month <= periodEnd.slice(0, 7)
                )
                .sort((a, b) => b.month.localeCompare(a.month));

            const latestSnapshot = snapshots[0];

            const eligibleTransactions = activeTransactions.filter(
                (item) =>
                    item.investment_id === investment.id &&
                    item.transaction_date <= periodEnd
            );

            const transactionBalance = eligibleTransactions.reduce(
                (balance, item) => {
                    const amount = Number(item.amount || 0);

                    return item.transaction_type === "CONTRIBUTION"
                        ? balance + amount
                        : balance - amount;
                },
                0
            );

            let currentValue = transactionBalance;

            if (latestSnapshot) {
                currentValue =
                    latestSnapshot.current_market_value !== null &&
                        latestSnapshot.current_market_value !== undefined
                        ? Number(latestSnapshot.current_market_value)
                        : Number(latestSnapshot.closing_balance || 0);
            }

            return {
                ...investment,
                currentValue: Math.max(0, currentValue),
                latestSnapshotMonth: latestSnapshot?.month || null,
            };
        });
    }, [
        activeInvestments,
        activeSnapshots,
        activeTransactions,
        effectiveSelectedInvestment,
        periodEnd,
    ]);

    const totalCurrentValue = investmentValues.reduce(
        (sum, item) => sum + item.currentValue,
        0
    );

    const monthlyReport = useMemo(() => {
        const monthNumbers =
            selectedMonth === "all"
                ? Array.from({ length: 12 }, (_, index) =>
                    String(index + 1).padStart(2, "0")
                )
                : [selectedMonth];

        return monthNumbers.map((monthNumber) => {
            const rows = periodTransactions.filter(
                (item) =>
                    (item.transaction_date || "").slice(5, 7) === monthNumber
            );

            const contributions = rows
                .filter((item) => item.transaction_type === "CONTRIBUTION")
                .reduce((sum, item) => sum + Number(item.amount || 0), 0);

            const withdrawals = rows
                .filter((item) => item.transaction_type === "WITHDRAWAL")
                .reduce((sum, item) => sum + Number(item.amount || 0), 0);

            return {
                monthNumber,
                monthName: MONTHS[Number(monthNumber) - 1],
                contributions,
                withdrawals,
                netChange: contributions - withdrawals,
                transactionCount: rows.length,
            };
        });
    }, [periodTransactions, selectedMonth]);

    const maxMonthlyValue = Math.max(
        1,
        ...monthlyReport.map((item) =>
            Math.max(item.contributions, item.withdrawals)
        )
    );

    const investmentActivity = useMemo(() => {
        return investmentValues.map((investment) => {
            const rows = periodTransactions.filter(
                (item) => item.investment_id === investment.id
            );

            const contributions = rows
                .filter((item) => item.transaction_type === "CONTRIBUTION")
                .reduce((sum, item) => sum + Number(item.amount || 0), 0);

            const withdrawals = rows
                .filter((item) => item.transaction_type === "WITHDRAWAL")
                .reduce((sum, item) => sum + Number(item.amount || 0), 0);

            return {
                ...investment,
                contributions,
                withdrawals,
                transactionCount: rows.length,
            };
        });
    }, [investmentValues, periodTransactions]);

    const periodLabel =
        selectedMonth === "all"
            ? selectedYear
            : `${MONTHS[Number(selectedMonth) - 1]} ${selectedYear}`;

    return (
        <div className="investment-dashboard-page">
            <InvestmentPageHeader
                title="Investment Dashboard"
                description="Track your active investment value, contributions, withdrawals and monthly performance."
            />

            <InvestmentSection
                title="Dashboard Filters"
                description="Choose the reporting period and active investment."
            >
                <div className="investment-dashboard-filters">
                    <div>
                        <label>Year</label>
                        <select
                            value={selectedYear}
                            onChange={(event) =>
                                setSelectedYear(event.target.value)
                            }
                        >
                            {years.map((year) => (
                                <option key={year} value={String(year)}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Month</label>
                        <select
                            value={selectedMonth}
                            onChange={(event) =>
                                setSelectedMonth(event.target.value)
                            }
                        >
                            <option value="all">All Months</option>
                            {MONTHS.map((month, index) => (
                                <option
                                    key={month}
                                    value={String(index + 1).padStart(2, "0")}
                                >
                                    {month}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Investment</label>
                        <select
                            value={effectiveSelectedInvestment}
                            onChange={(event) =>
                                setSelectedInvestment(event.target.value)
                            }
                        >
                            <option value="all">All Active Investments</option>
                            {activeInvestments.map((investment) => (
                                <option
                                    key={investment.id}
                                    value={investment.id}
                                >
                                    {investment.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </InvestmentSection>

            {loading ? (
                <div className="investment-dashboard-loading">
                    Loading investment dashboard...
                </div>
            ) : (
                <>
                    <div className="investment-dashboard-period">
                        Showing active investment details for{" "}
                        <strong>{periodLabel}</strong>
                        <span>Value calculated as of {periodEnd}</span>
                    </div>

                    <div className="investment-dashboard-cards">
                        <div className="investment-dashboard-card current-value">
                            <div className="investment-dashboard-card-icon">
                                <Wallet />
                            </div>
                            <span>Total Current Value</span>
                            <strong>{formatCurrency(totalCurrentValue)}</strong>
                            <small>Latest available active valuation</small>
                        </div>

                        <div className="investment-dashboard-card">
                            <div className="investment-dashboard-card-icon contribution">
                                <TrendingUp />
                            </div>
                            <span>Total Contributions</span>
                            <strong>{formatCurrency(summary.contributions)}</strong>
                            <small>For selected period</small>
                        </div>

                        <div className="investment-dashboard-card">
                            <div className="investment-dashboard-card-icon withdrawal">
                                <TrendingDown />
                            </div>
                            <span>Total Withdrawals</span>
                            <strong>{formatCurrency(summary.withdrawals)}</strong>
                            <small>For selected period</small>
                        </div>

                        <div className="investment-dashboard-card">
                            <div className="investment-dashboard-card-icon net">
                                <PiggyBank />
                            </div>
                            <span>Net Invested</span>
                            <strong>{formatCurrency(summary.netInvested)}</strong>
                            <small>Contributions minus withdrawals</small>
                        </div>

                        <div className="investment-dashboard-card">
                            <div className="investment-dashboard-card-icon count">
                                <ArrowLeftRight />
                            </div>
                            <span>Total Profit</span>
                            <strong>
                                {formatCurrency(
                                    totalCurrentValue - summary.contributions
                                )}
                            </strong>
                            <small>Current value minus period contributions</small>
                        </div>

                        <div className="investment-dashboard-card">
                            <div className="investment-dashboard-card-icon count">
                                <ArrowLeftRight />
                            </div>
                            <span>Transactions</span>
                            <strong>{summary.transactionCount}</strong>
                            <small>For selected period</small>
                        </div>
                    </div>

                    <InvestmentSection
                        title="Monthly Investment Activity"
                        description="Compare monthly contributions and withdrawals."
                    >
                        <div className="investment-dashboard-chart">
                            {monthlyReport.map((item) => (
                                <div
                                    className="investment-dashboard-chart-row"
                                    key={item.monthNumber}
                                >
                                    <div className="investment-dashboard-chart-month">
                                        {item.monthName.slice(0, 3)}
                                    </div>

                                    <div className="investment-dashboard-bars">
                                        <div className="investment-dashboard-bar-line">
                                            <div className="investment-dashboard-bar-track">
                                                <div
                                                    className="investment-dashboard-bar contribution"
                                                    style={{
                                                        width: `${(item.contributions / maxMonthlyValue) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                            <span>
                                                {formatCurrency(item.contributions)}
                                            </span>
                                        </div>

                                        <div className="investment-dashboard-bar-line">
                                            <div className="investment-dashboard-bar-track">
                                                <div
                                                    className="investment-dashboard-bar withdrawal"
                                                    style={{
                                                        width: `${(item.withdrawals / maxMonthlyValue) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                            <span>
                                                {formatCurrency(item.withdrawals)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="investment-dashboard-legend">
                            <span>
                                <i className="contribution" /> Contributions
                            </span>
                            <span>
                                <i className="withdrawal" /> Withdrawals
                            </span>
                        </div>
                    </InvestmentSection>

                    <InvestmentSection
                        title="Investment-wise Summary"
                        description="Current value and transaction activity for each active investment."
                    >
                        <div className="investment-dashboard-table-wrapper">
                            <table className="investment-dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Investment</th>
                                        <th>Type</th>
                                        <th>Current Value</th>
                                        <th>Contributions</th>
                                        <th>Withdrawals</th>
                                        <th>Transactions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {investmentActivity.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="investment-dashboard-empty"
                                            >
                                                No active investments found.
                                            </td>
                                        </tr>
                                    ) : (
                                        investmentActivity.map((item) => (
                                            <tr key={item.id}>
                                                <td className="investment-dashboard-name">
                                                    {item.name}
                                                </td>
                                                <td>{item.investment_type}</td>
                                                <td>
                                                    <strong>
                                                        {formatCurrency(item.currentValue)}
                                                    </strong>
                                                </td>
                                                <td className="investment-dashboard-positive">
                                                    {formatCurrency(item.contributions)}
                                                </td>
                                                <td className="investment-dashboard-negative">
                                                    {formatCurrency(item.withdrawals)}
                                                </td>
                                                <td>{item.transactionCount}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </InvestmentSection>
                </>
            )}
        </div>
    );
}
