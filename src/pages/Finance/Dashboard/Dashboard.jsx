
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTransactions } from "../../../features/transactions/transactionSlice";
import "./Dashboard.css";

// =====================================================
// HELPERS
// =====================================================

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

// =====================================================
// DASHBOARD
// =====================================================

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

  // =====================================================
  // DASHBOARD CALCULATIONS
  // =====================================================

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
      (transaction) =>
        getDateKey(transaction).slice(0, 7) === currentMonthKey
    );

    const previousMonthTransactions = transactions.filter(
      (transaction) =>
        getDateKey(transaction).slice(0, 7) === previousMonthKey
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
        (transaction) =>
          getDateKey(transaction).slice(0, 7) === monthKey
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

        result[category] =
          (result[category] || 0) + getAmount(transaction);

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
      currentMonthTransactions,
      netSavings,
      savingsRate,
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
    currentMonthTransactions,
    netSavings,
    savingsRate,
    currentMonthLabel,
    incomeChange,
    expenseChange,
  } = dashboard;

  const topExpenseCategory = expenseCategories[0];

  const maxChartValue = Math.max(
    ...monthlyTrend.flatMap((month) => [
      month.income,
      month.expense,
    ]),
    1
  );

  const userName = getUserName(user);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-state">
          <div className="dashboard-spinner" />
          <h3>Preparing your financial overview</h3>
          <p>Getting your latest financial information ready...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR STATE
  // =====================================================

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-state dashboard-error">
          <div className="dashboard-state-icon">!</div>
          <h3>Unable to load your dashboard</h3>
          <p>{error}</p>

          <button onClick={() => dispatch(fetchTransactions())}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="dashboard-page">

      {/* =================================================
          WELCOME INTRODUCTION
      ================================================= */}

      <header className="dashboard-welcome">

        <div className="welcome-main-content">
          <span className="dashboard-eyebrow">
            YOUR PERSONAL FINANCE SPACE
          </span>

          <h1>
            Welcome back, <span>{userName}</span>
          </h1>

          <p className="welcome-description">
            Stay on top of your money. Understand your spending,
            track your savings, and keep moving towards your
            financial goals.
          </p>

          <div className="welcome-highlights">

            <div className="welcome-highlight-item">
              <span className="welcome-highlight-icon">
                <span>▤</span>
              </span>

              <div>
                <strong>{currentMonthTransactions.length}</strong>
                <small>Transactions this month</small>
              </div>
            </div>

            <div className="welcome-highlight-divider" />

            <div className="welcome-highlight-item">
              <span className="welcome-highlight-icon">
                <span>{netSavings >= 0 ? "↗" : "↘"}</span>
              </span>

              <div>
                <strong>
                  {netSavings >= 0 ? "Saving" : "Overspending"}
                </strong>
                <small>Current financial position</small>
              </div>
            </div>

            <div className="welcome-highlight-divider" />

            <div className="welcome-highlight-item">
              <span className="welcome-highlight-icon">
                <span>◎</span>
              </span>

              <div>
                <strong>
                  {topExpenseCategory?.name || "No expenses"}
                </strong>
                <small>Top spending category</small>
              </div>
            </div>

          </div>
        </div>

        <div className="dashboard-current-date">
          <div className="welcome-date-icon">◷</div>
          <span className="welcome-date-label">TODAY</span>
          <strong>{today}</strong>
          <div className="welcome-month-pill">
            {currentMonthLabel}
          </div>
        </div>

      </header>

      {/* =================================================
          FINANCIAL SNAPSHOT
      ================================================= */}

      <section className="dashboard-section">

        <div className="dashboard-section-heading">
          <div>
            <span className="section-eyebrow">MONTHLY OVERVIEW</span>
            <h2>Your financial snapshot</h2>
            <p>
              A quick look at your financial position for{" "}
              {currentMonthLabel}.
            </p>
          </div>

          <span className="section-status-pill">
            <span className="status-live-dot" />
            Current month
          </span>
        </div>

        <div className="dashboard-kpi-grid">

          {/* Income */}

          <article className="dashboard-kpi-card kpi-income-card">
            <div className="kpi-top">
              <span className="kpi-icon kpi-income">↙</span>
              <span className="kpi-caption">TOTAL INCOME</span>
            </div>

            <strong className="kpi-value">
              {formatCurrency(currentTotals.income)}
            </strong>

            <div className="kpi-card-footer">
              <span className="kpi-footer-icon">↗</span>
              <span>{getChangeLabel(incomeChange)}</span>
            </div>

            <span className="kpi-decoration kpi-decoration-income" />
          </article>

          {/* Expenses */}

          <article className="dashboard-kpi-card kpi-expense-card">
            <div className="kpi-top">
              <span className="kpi-icon kpi-expense">↗</span>
              <span className="kpi-caption">TOTAL EXPENSES</span>
            </div>

            <strong className="kpi-value">
              {formatCurrency(currentTotals.expense)}
            </strong>

            <div className="kpi-card-footer">
              <span className="kpi-footer-icon">◈</span>
              <span>{getChangeLabel(expenseChange)}</span>
            </div>

            <span className="kpi-decoration kpi-decoration-expense" />
          </article>

          {/* Savings */}

          <article className="dashboard-kpi-card kpi-savings-card">
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

            <div className="kpi-card-footer">
              <span className="kpi-footer-icon">◉</span>
              <span>Income minus expenses</span>
            </div>

            <span className="kpi-decoration kpi-decoration-savings" />
          </article>

          {/* Savings Rate */}

          <article className="dashboard-kpi-card kpi-rate-card">
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

            <div className="kpi-card-footer">
              <span className="kpi-footer-icon">✦</span>
              <span>Of this month's income</span>
            </div>

            <span className="kpi-decoration kpi-decoration-rate" />
          </article>

        </div>
      </section>

      {/* =================================================
          ANALYTICS
      ================================================= */}

      <section className="dashboard-analytics-grid">

        {/* Cash Flow */}

        <article className="dashboard-card cashflow-card">

          <div className="dashboard-card-heading">
            <div>
              <span className="card-eyebrow">FINANCIAL TREND</span>
              <h2>Cash flow</h2>
              <p>Income vs expenses over the last 6 months</p>
            </div>

            <span className="dashboard-period-label">
              LAST 6 MONTHS
            </span>
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

          <div
            className="cashflow-chart"
            role="img"
            aria-label="Monthly income and expense comparison for the last six months"
          >
            {monthlyTrend.map((month) => (
              <div className="cashflow-month" key={month.key}>

                <div className="cashflow-bars">

                  <div
                    className="cashflow-bar income-bar"
                    style={{
                      height: `${month.income > 0
                          ? Math.max(
                            (month.income / maxChartValue) * 100,
                            2
                          )
                          : 0
                        }%`,
                    }}
                    title={`Income: ${formatCurrency(month.income)}`}
                  />

                  <div
                    className="cashflow-bar expense-bar"
                    style={{
                      height: `${month.expense > 0
                          ? Math.max(
                            (month.expense / maxChartValue) * 100,
                            2
                          )
                          : 0
                        }%`,
                    }}
                    title={`Expenses: ${formatCurrency(month.expense)}`}
                  />

                </div>

                <span>{month.label}</span>
              </div>
            ))}
          </div>

          <div className="cashflow-chart-footer">
            <div>
              <span className="footer-indicator income-indicator" />
              <span>6-month income</span>
              <strong>
                {formatCurrency(
                  monthlyTrend.reduce(
                    (sum, month) => sum + month.income,
                    0
                  )
                )}
              </strong>
            </div>

            <div>
              <span className="footer-indicator expense-indicator" />
              <span>6-month expenses</span>
              <strong>
                {formatCurrency(
                  monthlyTrend.reduce(
                    (sum, month) => sum + month.expense,
                    0
                  )
                )}
              </strong>
            </div>
          </div>

        </article>

        {/* Expense Categories */}

        <article className="dashboard-card category-card">

          <div className="dashboard-card-heading">
            <div>
              <span className="card-eyebrow">SPENDING ANALYSIS</span>
              <h2>Where your money goes</h2>
              <p>Top expense categories this month</p>
            </div>
          </div>

          {expenseCategories.length === 0 ? (
            <div className="dashboard-card-empty">
              <span className="empty-state-icon">₹</span>
              <strong>No expenses recorded</strong>
              <p>
                Your expense categories will appear here
                when you add transactions.
              </p>
            </div>
          ) : (
            <div className="category-breakdown">

              {expenseCategories.map((category, index) => (
                <div
                  className="category-breakdown-item"
                  key={category.name}
                >
                  <div className="category-breakdown-heading">
                    <div className="category-name-group">
                      <span className={`category-rank rank-${index + 1}`}>
                        {index + 1}
                      </span>
                      <strong>{category.name}</strong>
                    </div>

                    <span>
                      {formatCurrency(category.amount)}
                    </span>
                  </div>

                  <div className="category-progress-track">
                    <div
                      className={`category-progress-fill category-fill-${index + 1}`}
                      style={{
                        width: `${category.percentage}%`,
                      }}
                    />
                  </div>

                  <span className="category-percentage">
                    {category.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}

            </div>
          )}

          {expenseCategories.length > 0 && (
            <div className="category-card-footer">
              <span>Total expense categories</span>
              <strong>{expenseCategories.length} shown</strong>
            </div>
          )}

        </article>

      </section>

      {/* =================================================
          MONTHLY FINANCIAL INSIGHT
      ================================================= */}

      <section
        className={`dashboard-insight ${netSavings >= 0 ? "insight-positive" : "insight-negative"
          }`}
      >

        <div className="insight-icon">
          {netSavings >= 0 ? "✦" : "!"}
        </div>

        <div className="insight-content">

          <span className="insight-label">
            YOUR MONTHLY FINANCIAL INSIGHT
          </span>

          {currentTotals.income === 0 &&
            currentTotals.expense === 0 ? (
            <p>
              You haven't recorded any transactions this month yet.
              Start adding your income and expenses to see your
              financial insights here.
            </p>
          ) : netSavings >= 0 ? (
            <p>
              Great progress! You have retained{" "}
              <strong>{formatCurrency(netSavings)}</strong> this month.
              Your savings rate is{" "}
              <strong>{savingsRate.toFixed(1)}%</strong>.
              {topExpenseCategory && (
                <>
                  {" "}Your highest spending category is{" "}
                  <strong>{topExpenseCategory.name}</strong>.
                </>
              )}
            </p>
          ) : (
            <p>
              Your expenses are{" "}
              <strong>{formatCurrency(Math.abs(netSavings))}</strong>{" "}
              higher than your income this month.
              {topExpenseCategory && (
                <>
                  {" "}Your highest spending category is{" "}
                  <strong>{topExpenseCategory.name}</strong>.
                </>
              )}
              {" "}Review your spending to identify areas where
              you can reduce expenses.
            </p>
          )}

          {expenseChange !== null &&
            (currentTotals.income > 0 || currentTotals.expense > 0) && (
              <small>
                Your expenses are{" "}
                <strong>
                  {Math.abs(expenseChange).toFixed(1)}%{" "}
                  {expenseChange > 0
                    ? "higher"
                    : expenseChange < 0
                      ? "lower"
                      : "unchanged"}
                </strong>{" "}
                compared with last month.
              </small>
            )}

        </div>

      </section>

      {/* =================================================
          RECENT TRANSACTIONS
      ================================================= */}

      <section className="dashboard-card recent-activity-card">

        <div className="dashboard-card-heading">
          <div>
            <span className="card-eyebrow">LATEST ACTIVITY</span>
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
            <strong>No transactions available</strong>
            <p>Your latest transactions will appear here.</p>
          </div>
        ) : (
          <div className="recent-activity-list">

            {recentTransactions.map((transaction) => {
              const isIncome = transaction.type === "income";

              return (
                <div
                  className="recent-activity-row"
                  key={transaction.id}
                >

                  <div
                    className={`activity-type-icon ${isIncome
                        ? "activity-income"
                        : "activity-expense"
                      }`}
                  >
                    {isIncome ? "↙" : "↗"}
                  </div>

                  <div className="activity-description">
                    <strong>
                      {getTransactionTitle(transaction)}
                    </strong>

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
                    className={`activity-amount ${isIncome
                        ? "amount-income"
                        : "amount-expense"
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
