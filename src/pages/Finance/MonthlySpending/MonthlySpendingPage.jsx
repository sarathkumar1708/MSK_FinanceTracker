import { useEffect, useMemo, useState } from "react";

import "./MonthlySpendingPage.css";
import PageHeader from "../../../components/common/PageHeader";
import { transactionService } from "../../../services/transactionService";
import { MONTHS } from "../../../data/data";

function formatTotal(amount) {
  return Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getYearRange(year) {
  return {
    startDate: `${year}-01-01`,
    endDate: `${Number(year) + 1}-01-01`,
  };
}

function getTransactionAmount(transaction) {
  if (transaction.amount !== undefined && transaction.amount !== null) {
    return Number(transaction.amount) || 0;
  }

  return (Number(transaction.amount_minor) || 0) / 100;
}

function getBalanceTone(balance) {
  if (balance > 0) return "positive";
  if (balance < 0) return "negative";
  return "neutral";
}

function MonthlySpendingPage() {
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const years = Array.from(
    { length: currentYear - 2000 + 3 },
    (_, index) => currentYear + 2 - index
  );

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

  const monthlyData = useMemo(() => {
    const monthSummary = MONTHS.map((month) => ({
      month: month.label,
      monthNumber: month.value,
      totalIncome: 0,
      totalExpense: 0,
      totalBalance: 0,
      transactionCount: 0,
    }));

    transactions.forEach((transaction) => {
      const transactionDate =
        transaction.date || transaction.transaction_date;

      if (!transactionDate) return;

      const transactionYear = transactionDate.slice(0, 4);
      const transactionMonth = transactionDate.slice(5, 7);

      if (transactionYear !== selectedYear) return;

      const month = monthSummary.find(
        (item) => item.monthNumber === transactionMonth
      );

      if (!month) return;

      const amount = getTransactionAmount(transaction);

      if (transaction.type === "income") {
        month.totalIncome += amount;
      } else if (transaction.type === "expense") {
        month.totalExpense += amount;
      }

      month.transactionCount += 1;
    });

    return monthSummary.map((month) => ({
      ...month,
      totalBalance: month.totalIncome - month.totalExpense,
    }));
  }, [transactions, selectedYear]);

  const yearlyTotals = useMemo(() => {
    return monthlyData.reduce(
      (result, month) => ({
        totalIncome: result.totalIncome + month.totalIncome,
        totalExpense: result.totalExpense + month.totalExpense,
        totalBalance: result.totalBalance + month.totalBalance,
        transactionCount:
          result.transactionCount + month.transactionCount,
      }),
      {
        totalIncome: 0,
        totalExpense: 0,
        totalBalance: 0,
        transactionCount: 0,
      }
    );
  }, [monthlyData]);

  return (
    <div className="page-container monthly-spending-page">
      <PageHeader
        title="Monthly Spending"
        description="Track your income, expenses and monthly balance throughout the year."
        icon="CalendarDays"
      />

      <div className="content-card monthly-spending-card">
        {/* YEAR TOOLBAR */}
        <div className="monthly-spending-toolbar">
          <div className="monthly-toolbar-heading">
            <span className="monthly-toolbar-eyebrow">
              FINANCIAL OVERVIEW
            </span>

            <h2>Yearly Financial Summary</h2>

            <p>
              Choose a year to explore your monthly financial activity.
            </p>
          </div>

          <div className="monthly-year-actions">
            <div className="year-selector">
              <label htmlFor="monthly-spending-year">
                Select Year
              </label>

              <select
                id="monthly-spending-year"
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
              >
                {years.map((year) => (
                  <option key={year} value={String(year)}>
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
        </div>

        {/* YEARLY SUMMARY */}
        <section className="yearly-summary">
          <div className="yearly-summary-header">
            <div>
              <span className="yearly-summary-eyebrow">
                YOUR FINANCIAL PERFORMANCE
              </span>

              <h3>{selectedYear} Overview</h3>

              <p>Annual income, expenses and net balance</p>
            </div>

            <div className="yearly-summary-year">
              {selectedYear}
            </div>
          </div>

          <div className="yearly-summary-grid">
            <div className="yearly-summary-item income-summary">
              <div className="yearly-item-top">
                <span className="yearly-item-icon">↗</span>
                <span className="yearly-item-label">Total Income</span>
              </div>

              <strong>
                ₹{formatTotal(yearlyTotals.totalIncome)}
              </strong>

              <small>Money received during the year</small>
            </div>

            <div className="yearly-summary-item expense-summary">
              <div className="yearly-item-top">
                <span className="yearly-item-icon">↘</span>
                <span className="yearly-item-label">Total Expense</span>
              </div>

              <strong>
                ₹{formatTotal(yearlyTotals.totalExpense)}
              </strong>

              <small>Money spent during the year</small>
            </div>

            <div
              className={`yearly-summary-item balance-summary ${getBalanceTone(
                yearlyTotals.totalBalance
              )}`}
            >
              <div className="yearly-item-top">
                <span className="yearly-item-icon">₹</span>
                <span className="yearly-item-label">Net Balance</span>
              </div>

              <strong>
                ₹{formatTotal(yearlyTotals.totalBalance)}
              </strong>

              <small>Income minus expenses</small>
            </div>

            <div className="yearly-summary-item count-summary">
              <div className="yearly-item-top">
                <span className="yearly-item-icon">#</span>
                <span className="yearly-item-label">Transactions</span>
              </div>

              <strong>{yearlyTotals.transactionCount}</strong>

              <small>Recorded transactions</small>
            </div>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div
            className="monthly-error-message"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* LOADING / MONTHLY BREAKDOWN */}
        {loading ? (
          <div className="monthly-loading">
            <div className="monthly-loading-spinner" />
            <span>Loading {selectedYear} transactions...</span>
          </div>
        ) : (
          <>
            <div className="monthly-section-header">
              <div>
                <span className="monthly-section-eyebrow">
                  MONTHLY PERFORMANCE
                </span>

                <h3>Monthly Breakdown</h3>

                <p>
                  Review your financial activity month by month.
                </p>
              </div>

              <span className="monthly-period-label">
                January – December {selectedYear}
              </span>
            </div>

            <div className="monthly-summary-grid">
              {monthlyData.map((month, index) => (
                <div
                  className={`monthly-summary-card month-color-${index + 1} ${month.transactionCount === 0 ? "empty-month" : ""
                    }`}
                  key={month.monthNumber}
                >
                  <div className="monthly-card-header">
                    <div className="monthly-month-title">
                      <span className="monthly-month-indicator" />
                      <h3>{month.month}</h3>
                    </div>

                    <span className="monthly-transaction-count">
                      {month.transactionCount}{" "}
                      {month.transactionCount === 1
                        ? "Transaction"
                        : "Transactions"}
                    </span>
                  </div>

                  <div className="monthly-card-details">
                    <div className="monthly-detail-row">
                      <span>Total Income</span>

                      <strong className="income-text">
                        ₹{formatTotal(month.totalIncome)}
                      </strong>
                    </div>

                    <div className="monthly-detail-row">
                      <span>Total Expense</span>

                      <strong className="expense-text">
                        ₹{formatTotal(month.totalExpense)}
                      </strong>
                    </div>

                    <div className="monthly-detail-divider" />

                    <div
                      className={`monthly-balance-row ${getBalanceTone(
                        month.totalBalance
                      )}`}
                    >
                      <span>Monthly Balance</span>

                      <strong>
                        ₹{formatTotal(month.totalBalance)}
                      </strong>
                    </div>
                  </div>

                  {month.transactionCount === 0 && (
                    <div className="monthly-empty-label">
                      No transactions recorded
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MonthlySpendingPage;