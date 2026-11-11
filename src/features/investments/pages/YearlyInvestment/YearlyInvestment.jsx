
import { useMemo, useState } from "react";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    ArrowLeftRight,
} from "lucide-react";

import {
    InvestmentPageHeader,
    InvestmentSection,
    formatCurrency,
} from "../../components/InvestmentShared/InvestmentShared";

import "./YearlyInvestment.css";

const MONTHS = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December",
];

export default function YearlyInvestment({
    investments = [],
    transactions = [],
    monthlySnapshots = [],
    loading = false,
}) {
    const currentYear = new Date().getFullYear();

    const [selectedYear, setSelectedYear] = useState(
        String(currentYear)
    );
    const [selectedMonth, setSelectedMonth] = useState("all");
    const [selectedInvestment, setSelectedInvestment] = useState("all");

    const years = useMemo(() => {
        const values = new Set([currentYear]);

        transactions.forEach((item) => {
            if (item.transaction_date) {
                values.add(Number(item.transaction_date.slice(0, 4)));
            }
        });

        monthlySnapshots.forEach((item) => {
            if (item.month) {
                values.add(Number(item.month.slice(0, 4)));
            }
        });

        return [...values].sort((a, b) => b - a);
    }, [transactions, monthlySnapshots, currentYear]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter((item) => {
            const date = item.transaction_date || "";

            const yearMatches =
                date.slice(0, 4) === selectedYear;

            const monthMatches =
                selectedMonth === "all" ||
                date.slice(5, 7) === selectedMonth;

            const investmentMatches =
                selectedInvestment === "all" ||
                item.investment_id === selectedInvestment;

            return (
                yearMatches &&
                monthMatches &&
                investmentMatches
            );
        });
    }, [
        transactions,
        selectedYear,
        selectedMonth,
        selectedInvestment,
    ]);

    const summary = useMemo(() => {
        const contributions = filteredTransactions
            .filter((item) => item.transaction_type === "CONTRIBUTION")
            .reduce((total, item) => total + Number(item.amount || 0), 0);

        const withdrawals = filteredTransactions
            .filter((item) => item.transaction_type === "WITHDRAWAL")
            .reduce((total, item) => total + Number(item.amount || 0), 0);

        return {
            contributions,
            withdrawals,
            netInvested: contributions - withdrawals,
            transactionCount: filteredTransactions.length,
        };
    }, [filteredTransactions]);

    const monthlyReport = useMemo(() => {
        const monthNumbers =
            selectedMonth === "all"
                ? Array.from({ length: 12 }, (_, index) =>
                    String(index + 1).padStart(2, "0")
                )
                : [selectedMonth];

        return monthNumbers.map((monthNumber) => {
            const monthTransactions = filteredTransactions.filter(
                (item) =>
                    item.transaction_date.slice(5, 7) === monthNumber
            );

            const contributions = monthTransactions
                .filter((item) => item.transaction_type === "CONTRIBUTION")
                .reduce((total, item) => total + Number(item.amount || 0), 0);

            const withdrawals = monthTransactions
                .filter((item) => item.transaction_type === "WITHDRAWAL")
                .reduce((total, item) => total + Number(item.amount || 0), 0);

            return {
                monthNumber,
                monthName: MONTHS[Number(monthNumber) - 1],
                contributions,
                withdrawals,
                netChange: contributions - withdrawals,
                transactionCount: monthTransactions.length,
            };
        });
    }, [filteredTransactions, selectedMonth]);

    const investmentReport = useMemo(() => {
        const selectedInvestments =
            selectedInvestment === "all"
                ? investments
                : investments.filter(
                    (item) => item.id === selectedInvestment
                );

        return selectedInvestments.map((investment) => {
            const rows = filteredTransactions.filter(
                (item) => item.investment_id === investment.id
            );

            const contributions = rows
                .filter((item) => item.transaction_type === "CONTRIBUTION")
                .reduce((total, item) => total + Number(item.amount || 0), 0);

            const withdrawals = rows
                .filter((item) => item.transaction_type === "WITHDRAWAL")
                .reduce((total, item) => total + Number(item.amount || 0), 0);

            return {
                ...investment,
                contributions,
                withdrawals,
                netChange: contributions - withdrawals,
                transactionCount: rows.length,
            };
        }).filter((item) => item.transactionCount > 0);
    }, [investments, filteredTransactions, selectedInvestment]);

    return (
        <div className="yearly-investment-page">
            <InvestmentPageHeader
                title="Yearly Investment"
                description="Review your yearly investment contributions, withdrawals and monthly activity."
            />

            <InvestmentSection
                title="Report Filters"
                description="Choose the year, month and investment to view your report."
            >
                <div className="yearly-investment-filters">
                    <div className="yearly-filter-field">
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

                    <div className="yearly-filter-field">
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

                    <div className="yearly-filter-field">
                        <label>Investment</label>
                        <select
                            value={selectedInvestment}
                            onChange={(event) =>
                                setSelectedInvestment(event.target.value)
                            }
                        >
                            <option value="all">All Investments</option>
                            {investments.map((investment) => (
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

            <div className="yearly-investment-summary">
                <div className="yearly-summary-card">
                    <div className="yearly-summary-icon">
                        <TrendingUp />
                    </div>
                    <span>Total Contributions</span>
                    <strong>{formatCurrency(summary.contributions)}</strong>
                </div>

                <div className="yearly-summary-card">
                    <div className="yearly-summary-icon withdrawal">
                        <TrendingDown />
                    </div>
                    <span>Total Withdrawals</span>
                    <strong>{formatCurrency(summary.withdrawals)}</strong>
                </div>

                <div className="yearly-summary-card">
                    <div className="yearly-summary-icon balance">
                        <Wallet />
                    </div>
                    <span>Net Invested</span>
                    <strong>{formatCurrency(summary.netInvested)}</strong>
                </div>

                <div className="yearly-summary-card">
                    <div className="yearly-summary-icon count">
                        <ArrowLeftRight />
                    </div>
                    <span>Transactions</span>
                    <strong>{summary.transactionCount}</strong>
                </div>
            </div>

            <InvestmentSection
                title="Monthly Investment Breakdown"
                description={`Investment activity for ${selectedYear}.`}
            >
                {loading ? (
                    <div className="yearly-empty-state">
                        Loading investment report...
                    </div>
                ) : (
                    <div className="yearly-table-wrapper">
                        <table className="yearly-investment-table">
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Contributions</th>
                                    <th>Withdrawals</th>
                                    <th>Net Change</th>
                                    <th>Transactions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {monthlyReport.map((item) => (
                                    <tr key={item.monthNumber}>
                                        <td className="yearly-month-name">
                                            {item.monthName}
                                        </td>
                                        <td className="yearly-positive">
                                            {formatCurrency(item.contributions)}
                                        </td>
                                        <td className="yearly-negative">
                                            {formatCurrency(item.withdrawals)}
                                        </td>
                                        <td>
                                            <strong>
                                                {formatCurrency(item.netChange)}
                                            </strong>
                                        </td>
                                        <td>{item.transactionCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </InvestmentSection>

            <InvestmentSection
                title="Investment-wise Breakdown"
                description="Compare contributions and withdrawals for each investment."
            >
                <div className="yearly-table-wrapper">
                    <table className="yearly-investment-table">
                        <thead>
                            <tr>
                                <th>Investment</th>
                                <th>Type</th>
                                <th>Contributions</th>
                                <th>Withdrawals</th>
                                <th>Net Change</th>
                                <th>Transactions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {investmentReport.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="yearly-no-data">
                                        No investment transactions found for these filters.
                                    </td>
                                </tr>
                            ) : (
                                investmentReport.map((item) => (
                                    <tr key={item.id}>
                                        <td className="yearly-month-name">
                                            {item.name}
                                        </td>
                                        <td>{item.investment_type}</td>
                                        <td className="yearly-positive">
                                            {formatCurrency(item.contributions)}
                                        </td>
                                        <td className="yearly-negative">
                                            {formatCurrency(item.withdrawals)}
                                        </td>
                                        <td>
                                            <strong>
                                                {formatCurrency(item.netChange)}
                                            </strong>
                                        </td>
                                        <td>{item.transactionCount}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </InvestmentSection>

            <InvestmentSection
                title="Transaction Details"
                description="All transactions matching the selected filters."
            >
                <div className="yearly-table-wrapper">
                    <table className="yearly-investment-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Investment</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Notes</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="yearly-no-data">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                [...filteredTransactions]
                                    .sort((a, b) =>
                                        b.transaction_date.localeCompare(
                                            a.transaction_date
                                        )
                                    )
                                    .map((transaction) => {
                                        const investment = investments.find(
                                            (item) =>
                                                item.id === transaction.investment_id
                                        );

                                        return (
                                            <tr key={transaction.id}>
                                                <td>
                                                    {transaction.transaction_date}
                                                </td>
                                                <td>
                                                    {investment?.name || "Investment"}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`yearly-transaction-badge ${transaction.transaction_type === "CONTRIBUTION"
                                                            ? "contribution"
                                                            : "withdrawal"
                                                            }`}
                                                    >
                                                        {transaction.transaction_type}
                                                    </span>
                                                </td>
                                                <td>
                                                    <strong>
                                                        {formatCurrency(transaction.amount)}
                                                    </strong>
                                                </td>
                                                <td>
                                                    {transaction.notes || "—"}
                                                </td>
                                            </tr>
                                        );
                                    })
                            )}
                        </tbody>
                    </table>
                </div>
            </InvestmentSection>
        </div>
    );
}
