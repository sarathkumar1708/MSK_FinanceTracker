
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTransactions } from "../../../features/transactions/transactionSlice";
import "./Dashboard.css";

// -------------------- Helpers --------------------

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const formatAmount = (amount) =>
  currencyFormatter.format(Number(amount) || 0);

const formatCurrency = (amount) => `₹${formatAmount(amount)}`;

const getAmount = (transaction) => {
  if (transaction.amount_minor != null) {
    return (Number(transaction.amount_minor) || 0) / 100;
  }

  return Number(transaction.amount) || 0;
};

const getDateKey = (transaction) =>
  String(transaction.transaction_date || transaction.date || "").slice(0, 10);

const getCategory = (transaction) =>
  transaction.category ||
  transaction.categories?.name ||
  "Uncategorized";

const getTransactionTitle = (transaction) =>
  transaction.title ||
  transaction.description ||
  getCategory(transaction);

const getUserName = (user) =>
  user?.user_metadata?.name ||
  user?.user_metadata?.full_name ||
  user?.full_name ||
  user?.email?.split("@")[0] ||
  "there";

const getMonthKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatMonth = (date) =>
  date.toLocaleDateString("en-IN", { month: "short" });

const getChangePercentage = (current, previous) => {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return ((current - previous) / previous) * 100;
};

const getChangeLabel = (change) => {
  if (change === null) return "New this month";

  if (change === 0) return "No change from last month";

  return `${change > 0 ? "+" : ""}${change.toFixed(1)}% vs last month`;
};

// -------------------- Dashboard --------------------

function Dashboard() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const {
    items = [],
    loading,
    error,
  } = useSelector((state) => state.transactions);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchTransactions());
    }
  }, [user?.id, dispatch]);

  const dashboard = useMemo(() => {
    const transactions = Array.isArray(items) ? items : [];
    const today = new Date();

    const currentMonthDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    const previousMonthDate = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );

    const currentMonthKey = getMonthKey(currentMonthDate);
    const previousMonthKey = getMonthKey(previousMonthDate);

    const currentMonthTransactions = transactions.filter(
      (transaction) => getDateKey(transaction).slice(0, 7) === currentMonthKey
    );

    const previousMonthTransactions = transactions.filter(
      (transaction) => getDateKey(transaction).slice(0, 7) === previousMonthKey
    );

    const calculateTotals = (list) =>
      list.reduce(
        (totals, transaction) => {
          const amount = getAmount(transaction);

          if (transaction.type === "income") {
            totals.income += amount;
          } else if (transaction.type === "expense") {
            totals.expense += amount;
          }

          return totals;
        },
        { income: 0, expense: 0 }
      );

    const currentTotals = calculateTotals(currentMonthTransactions);
    const previousTotals = calculateTotals(previousMonthTransactions);

    // Last six months' income and expenses.
    const monthlyTrend = Array.from({ length: 6 }, (_, index) => {
      const monthDate = new Date(
        today.getFullYear(),
        today.getMonth() - (5 - index),
        1
      );

      const monthKey = getMonthKey(monthDate);

      const monthTransactions = transactions.filter(
        (transaction) => getDateKey(transaction).slice(0, 7) === monthKey
      );

      const totals = calculateTotals(monthTransactions);

      return {
        key: monthKey,
        label: formatMonth(monthDate),
        income: totals.income,
        expense: totals.expense,
      };
    });

    // Current month's expense category breakdown.
    const categoryTotals = currentMonthTransactions.reduce(
      (result, transaction) => {
        if (transaction.type !== "expense") return result;

        const category = getCategory(transaction);
        result[category] = (result[category] || 0) + getAmount(transaction);

        return result;
      },
      {}
    );

    const totalCategoryExpense = Object.values(categoryTotals).reduce(
      (total, amount) => total + amount,
      0
    );

    const expenseCategories = Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage:
          totalCategoryExpense > 0
            ? (amount / totalCategoryExpense) * 100
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Latest five transactions.
    const recentTransactions = [...transactions]
      .sort((a, b) => {
        const dateComparison = getDateKey(b).localeCompare(getDateKey(a));

        if (dateComparison !== 0) return dateComparison;

        return String(b.created_at || "").localeCompare(
          String(a.created_at || "")
        );
      })
      .slice(0, 5);

    const netSavings = currentTotals.income - currentTotals.expense;

    const savingsRate =
      currentTotals.income > 0
        ? (netSavings / currentTotals.income) * 100
        : 0;

    return {
      currentTotals,
      previousTotals,
      monthlyTrend,
      expenseCategories,
      recentTransactions,
      netSavings,
      savingsRate,
      currentMonthTransactions,
      currentMonthLabel: today.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      }),
      incomeChange: getChangePercentage(
        currentTotals.income,
        previousTotals.income
      ),
      expenseChange: getChangePercentage(
        currentTotals.expense,
        previousTotals.expense
      ),
    };
  }, [items]);

  const {
    currentTotals,
    monthlyTrend,
    expenseCategories,
    recentTransactions,
    netSavings,
    savingsRate,
    currentMonthTransactions,
    currentMonthLabel,
    incomeChange,
    expenseChange,
  } = dashboard;

  const maxChartValue = Math.max(
    ...monthlyTrend.flatMap((month) => [month.income, month.expense]),
    1
  );

  const userName = getUserName(user);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-state">
          <div className="dashboard-spinner" />
          <p>Preparing your financial overview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-state dashboard-error">
          <h3>Unable to load your dashboard</h3>
          <p>{error}</p>
          <button onClick={() => dispatch(fetchTransactions())}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* Header */}

      <header className="dashboard-welcome">
        <div>
          <span className="dashboard-eyebrow">FINANCIAL OVERVIEW</span>
          <h1>Welcome back, {userName}</h1>
          <p>Here's what's happening with your money.</p>
        </div>

        <div className="dashboard-current-date">
          <span>{today}</span>
          <strong>{currentMonthLabel}</strong>
        </div>
      </header>

      {/* Current Month Summary */}

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <h2>Your financial snapshot</h2>
            <p>Overview for {currentMonthLabel}</p>
          </div>
        </div>

        <div className="dashboard-kpi-grid">

          <article className="dashboard-kpi-card">
            <div className="kpi-top">
              <span className="kpi-icon kpi-income">↙</span>
              <span className="kpi-caption">INCOME</span>
            </div>

            <strong className="kpi-value">
              {formatCurrency(currentTotals.income)}
            </strong>

            <span className="kpi-comparison">
              {getChangeLabel(incomeChange)}
            </span>
          </article>

          <article className="dashboard-kpi-card">
            <div className="kpi-top">
              <span className="kpi-icon kpi-expense">↗</span>
              <span className="kpi-caption">EXPENSES</span>
            </div>

            <strong className="kpi-value">
              {formatCurrency(currentTotals.expense)}
            </strong>

            <span className="kpi-comparison">
              {getChangeLabel(expenseChange)}
            </span>
          </article>

          <article className="dashboard-kpi-card">
            <div className="kpi-top">
              <span className="kpi-icon kpi-savings">₹</span>
              <span className="kpi-caption">
                {netSavings >= 0 ? "NET SAVINGS" : "NET DEFICIT"}
              </span>
            </div>

            <strong
              className={`kpi-value ${netSavings < 0 ? "negative-value" : ""
                }`}
            >
              {formatCurrency(Math.abs(netSavings))}
            </strong>

            <span className="kpi-comparison">
              Income minus expenses
            </span>
          </article>

          <article className="dashboard-kpi-card">
            <div className="kpi-top">
              <span className="kpi-icon kpi-rate">%</span>
              <span className="kpi-caption">SAVINGS RATE</span>
            </div>

            <strong
              className={`kpi-value ${savingsRate < 0 ? "negative-value" : ""
                }`}
            >
              {savingsRate.toFixed(1)}%
            </strong>

            <span className="kpi-comparison">
              Of this month's income
            </span>
          </article>

        </div>
      </section>

      {/* Charts and Expense Breakdown */}

      <section className="dashboard-analytics-grid">

        <article className="dashboard-card cashflow-card">
          <div className="dashboard-card-heading">
            <div>
              <h2>Cash flow</h2>
              <p>Income vs expenses over the last 6 months</p>
            </div>

            <span className="dashboard-period-label">6 MONTHS</span>
          </div>

          <div className="cashflow-legend">
            <span>
              <i className="legend-dot legend-income" />
              Income
            </span>

            <span>
              <i className="legend-dot legend-expense" />
              Expenses
            </span>
          </div>

          <div className="cashflow-chart">
            {monthlyTrend.map((month) => (
              <div className="cashflow-month" key={month.key}>
                <div className="cashflow-bars">
                  <div
                    className="cashflow-bar income-bar"
                    style={{
                      height: `${Math.max(
                        (month.income / maxChartValue) * 100,
                        month.income > 0 ? 2 : 0
                      )}%`,
                    }}
                    title={`Income: ${formatCurrency(month.income)}`}
                  />

                  <div
                    className="cashflow-bar expense-bar"
                    style={{
                      height: `${Math.max(
                        (month.expense / maxChartValue) * 100,
                        month.expense > 0 ? 2 : 0
                      )}%`,
                    }}
                    title={`Expenses: ${formatCurrency(month.expense)}`}
                  />
                </div>

                <span>{month.label}</span>
              </div>
            ))}
          </div>

          <div className="cashflow-chart-footer">
            <span>Monthly financial activity</span>
            <span>
              {formatCurrency(
                monthlyTrend.reduce((sum, month) => sum + month.income, 0)
              )}{" "}
              total income
            </span>
          </div>
        </article>

        <article className="dashboard-card category-card">
          <div className="dashboard-card-heading">
            <div>
              <h2>Where your money goes</h2>
              <p>Top expense categories this month</p>
            </div>
          </div>

          {expenseCategories.length === 0 ? (
            <div className="dashboard-card-empty">
              <span className="empty-state-icon">₹</span>
              <p>No expenses recorded this month.</p>
            </div>
          ) : (
            <div className="category-breakdown">
              {expenseCategories.map((category) => (
                <div className="category-breakdown-item" key={category.name}>
                  <div className="category-breakdown-heading">
                    <strong>{category.name}</strong>
                    <span>{formatCurrency(category.amount)}</span>
                  </div>

                  <div className="category-progress-track">
                    <div
                      className="category-progress-fill"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>

                  <span className="category-percentage">
                    {category.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </article>

      </section>

      {/* Financial Insight */}

      <section className="dashboard-insight">
        <div className="insight-icon">✦</div>

        <div className="insight-content">
          <span>MONTHLY INSIGHT</span>

          {currentTotals.income === 0 && currentTotals.expense === 0 ? (
            <p>
              You haven't recorded any transactions this month yet.
              Start adding your income and expenses to see your financial
              insights here.
            </p>
          ) : netSavings >= 0 ? (
            <p>
              You have retained{" "}
              <strong>{formatCurrency(netSavings)}</strong> this month.
              Your savings rate is{" "}
              <strong>{savingsRate.toFixed(1)}%</strong>.
            </p>
          ) : (
            <p>
              Your expenses are{" "}
              <strong>{formatCurrency(Math.abs(netSavings))}</strong> higher
              than your income this month. Review your spending categories
              to understand where you can reduce expenses.
            </p>
          )}

          {expenseChange !== null && (
            <small>
              Expenses are {Math.abs(expenseChange).toFixed(1)}%{" "}
              {expenseChange > 0
                ? "higher"
                : expenseChange < 0
                  ? "lower"
                  : "unchanged"}{" "}
              compared with last month.
            </small>
          )}
        </div>
      </section>

      {/* Recent Transactions */}

      <section className="dashboard-card recent-activity-card">
        <div className="dashboard-card-heading">
          <div>
            <h2>Recent transactions</h2>
            <p>Your latest financial activities</p>
          </div>

          <span className="recent-record-count">
            {recentTransactions.length} latest records
          </span>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="dashboard-card-empty">
            <span className="empty-state-icon">₹</span>
            <p>No transactions available yet.</p>
          </div>
        ) : (
          <div className="recent-activity-list">
            {recentTransactions.map((transaction) => {
              const isIncome = transaction.type === "income";

              return (
                <div className="recent-activity-row" key={transaction.id}>
                  <div
                    className={`activity-type-icon ${isIncome ? "activity-income" : "activity-expense"
                      }`}
                  >
                    {isIncome ? "↙" : "↗"}
                  </div>

                  <div className="activity-description">
                    <strong>{getTransactionTitle(transaction)}</strong>
                    <span>
                      {getCategory(transaction)}
                      {transaction.subcategories?.name
                        ? ` · ${transaction.subcategories.name}`
                        : transaction.subcategory
                          ? ` · ${transaction.subcategory}`
                          : ""}
                    </span>
                  </div>

                  <div className="activity-date">
                    {formatDate(getDateKey(transaction))}
                  </div>

                  <strong
                    className={`activity-amount ${isIncome ? "amount-income" : "amount-expense"
                      }`}
                  >
                    {isIncome ? "+" : "−"}
                    {formatCurrency(getAmount(transaction))}
                  </strong>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}

export default Dashboard;
