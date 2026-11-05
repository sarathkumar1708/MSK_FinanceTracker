
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

function MonthlySpendingPage() {
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(
    String(currentYear)
  );

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Available years
  const years = Array.from(
    { length: currentYear - 2000 + 3 },
    (_, index) => currentYear + 2 - index
  );

  // Fetch all transactions for the selected year.
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

  // Group transactions into all 12 months.
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

  // Calculate yearly totals.
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

  const getBalanceTone = (balance) => {
    if (balance > 0) return "positive";
    if (balance < 0) return "negative";
    return "neutral";
  };

  return (
    <div className="page-container monthly-spending-page">
      <PageHeader
        title="Monthly Spending"
        description="View your income, expenses and balance month by month."
        icon="CalendarDays"
      />

      <div className="content-card monthly-spending-card">

        {/* Year Selection */}
        <div className="monthly-spending-toolbar">
          <div className="year-selector">
            <label htmlFor="monthly-spending-year">
              Select Year
            </label>

            <select
              id="monthly-spending-year"
              value={selectedYear}
              onChange={(event) => {
                setSelectedYear(event.target.value);
              }}
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
        <div className="yearly-summary">
          <div className="yearly-summary-header">
            <h3>{selectedYear} Overview</h3>
            <span>Yearly Summary</span>
          </div>

          <div className="yearly-summary-grid">
            <div className="yearly-summary-item income-summary">
              <span>Total Income</span>
              <strong>₹{formatTotal(yearlyTotals.totalIncome)}</strong>
            </div>

            <div className="yearly-summary-item expense-summary">
              <span>Total Expense</span>
              <strong>₹{formatTotal(yearlyTotals.totalExpense)}</strong>
            </div>

            <div
              className={`yearly-summary-item balance-summary ${getBalanceTone(
                yearlyTotals.totalBalance
              )}`}
            >
              <span>Net Balance</span>
              <strong>₹{formatTotal(yearlyTotals.totalBalance)}</strong>
            </div>

            <div className="yearly-summary-item count-summary">
              <span>Transactions</span>
              <strong>{yearlyTotals.transactionCount}</strong>
            </div>
          </div>
        </div>

        {/* Loading and Error */}
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="monthly-loading">
            Loading {selectedYear} transactions...
          </div>
        ) : (
          <>
            {/* Monthly Cards */}
            <div className="monthly-section-header">
              <h3>Monthly Breakdown</h3>
              <span>January - December {selectedYear}</span>
            </div>

            <div className="monthly-summary-grid">
              {monthlyData.map((month) => (
                <div
                  className="monthly-summary-card"
                  key={month.monthNumber}
                >
                  <div className="monthly-card-header">
                    <h3>{month.month}</h3>

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

                    <div className="monthly-detail-row monthly-balance-row">
                      <span>Balance</span>
                      <strong
                        className={getBalanceTone(month.totalBalance)}
                      >
                        ₹{formatTotal(month.totalBalance)}
                      </strong>
                    </div>
                  </div>

                  {month.transactionCount === 0 && (
                    <div className="monthly-empty-label">
                      No transactions
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
