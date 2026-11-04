
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTransactions } from "../../features/transactions/transactionSlice";
import "./Dashboard.css";

const formatAmount = (amount) => {
  return Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (date) => {
  if (!date) return "—";

  const [year, month, day] = String(date).split("T")[0].split("-");

  if (!year || !month || !day) return "—";

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return `${day} ${monthNames[Number(month) - 1]} ${year}`;
};

const getAmount = (transaction) => {
  if (transaction.amount_minor !== undefined &&
      transaction.amount_minor !== null) {
    return Number(transaction.amount_minor) / 100;
  }

  return Number(transaction.amount || 0);
};

const getCategory = (transaction) => {
  return transaction.category ||
    transaction.categories?.name ||
    "Uncategorized";
};

const getSubcategory = (transaction) => {
  return transaction.subcategory ||
    transaction.subcategories?.name ||
    "";
};

function Dashboard() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const userName = user?.user_metadata?.name || user?.email || user?.full_name || "User";


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

  const dashboardData = useMemo(() => {
    const totalIncome = items.reduce((total, transaction) => {
      return transaction.type === "income"
        ? total + getAmount(transaction)
        : total;
    }, 0);

    const totalExpense = items.reduce((total, transaction) => {
      return transaction.type === "expense"
        ? total + getAmount(transaction)
        : total;
    }, 0);

    const sortedTransactions = [...items].sort((a, b) => {
      const dateA = a.transaction_date || a.date || "";
      const dateB = b.transaction_date || b.date || "";

      return dateB.localeCompare(dateA);
    });

    return {
      totalIncome,
      totalExpense,
      totalBalance: totalIncome - totalExpense,
      recentTransactions: sortedTransactions.slice(0, 8),
      totalTransactions: items.length,
    };
  }, [items]);

  const {
    totalIncome,
    totalExpense,
    totalBalance,
    recentTransactions,
    totalTransactions,
  } = dashboardData;

  const expensePercentage =
    totalIncome + totalExpense > 0
      ? (totalExpense / (totalIncome + totalExpense)) * 100
      : 0;

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-spinner" />
          <p>Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <h3>Unable to load dashboard</h3>
          <p>{error}</p>
          <button onClick={() => dispatch(fetchTransactions())}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            PERSONAL FINANCE
          </span>

          <h1>Dashboard</h1>

          <p>
            Welcome back{`, ${userName}`}.
            Here's your financial overview.
          </p>
        </div>

        <div className="dashboard-date">
          <span>Today</span>
          <strong>
            {new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </strong>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-summary-grid">

        <div className="summary-card income-card">
          <div className="summary-card-top">
            <div>
              <span className="summary-label">Total Income</span>
              <h2>₹{formatAmount(totalIncome)}</h2>
            </div>

            <div className="summary-icon income-icon">
              ↗
            </div>
          </div>

          <p className="summary-description">
            Money received
          </p>
        </div>

        <div className="summary-card expense-card">
          <div className="summary-card-top">
            <div>
              <span className="summary-label">Total Expenses</span>
              <h2>₹{formatAmount(totalExpense)}</h2>
            </div>

            <div className="summary-icon expense-icon">
              ↘
            </div>
          </div>

          <p className="summary-description">
            Money spent
          </p>
        </div>

        <div className="summary-card balance-card">
          <div className="summary-card-top">
            <div>
              <span className="summary-label">Available Balance</span>
              <h2>₹{formatAmount(totalBalance)}</h2>
            </div>

            <div className="summary-icon balance-icon">
              ₹
            </div>
          </div>

          <p className="summary-description">
            Income minus expenses
          </p>
        </div>

        <div className="summary-card transaction-count-card">
          <div className="summary-card-top">
            <div>
              <span className="summary-label">Transactions</span>
              <h2>{totalTransactions}</h2>
            </div>

            <div className="summary-icon count-icon">
              #
            </div>
          </div>

          <p className="summary-description">
            Total recorded transactions
          </p>
        </div>

      </div>

      {/* Financial Overview */}
      <div className="dashboard-overview-grid">

        <section className="dashboard-panel overview-panel">
          <div className="panel-heading">
            <div>
              <h3>Income & Expenses</h3>
              <p>Your overall money distribution</p>
            </div>
          </div>

          <div className="overview-amounts">
            <div>
              <span className="overview-dot income-dot" />
              <span>Income</span>
              <strong>₹{formatAmount(totalIncome)}</strong>
            </div>

            <div>
              <span className="overview-dot expense-dot" />
              <span>Expenses</span>
              <strong>₹{formatAmount(totalExpense)}</strong>
            </div>
          </div>

          <div className="overview-progress">
            <div
              className="overview-income-bar"
              style={{
                width: `${100 - expensePercentage}%`,
              }}
            />

            <div
              className="overview-expense-bar"
              style={{
                width: `${expensePercentage}%`,
              }}
            />
          </div>

          <div className="overview-footer">
            <span>
              {expensePercentage.toFixed(1)}% of recorded income
              and expenses is spending
            </span>
          </div>
        </section>

        <section className="dashboard-panel balance-panel">
          <div className="panel-heading">
            <div>
              <h3>Financial Summary</h3>
              <p>Your overall financial position</p>
            </div>
          </div>

          <div className="financial-summary-row">
            <span>Total Income</span>
            <strong className="text-income">
              + ₹{formatAmount(totalIncome)}
            </strong>
          </div>

          <div className="financial-summary-row">
            <span>Total Expenses</span>
            <strong className="text-expense">
              - ₹{formatAmount(totalExpense)}
            </strong>
          </div>

          <div className="financial-summary-divider" />

          <div className="financial-summary-row final-balance">
            <span>Net Balance</span>
            <strong className={totalBalance >= 0
              ? "text-income"
              : "text-expense"
            }>
              ₹{formatAmount(totalBalance)}
            </strong>
          </div>
        </section>

      </div>

      {/* Recent Transactions */}
      <section className="dashboard-panel recent-transactions-panel">

        <div className="panel-heading recent-heading">
          <div>
            <h3>Recent Transactions</h3>
            <p>Your latest financial activities</p>
          </div>

          <span className="transaction-count-badge">
            {totalTransactions} Records
          </span>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="dashboard-empty">
            <div className="empty-icon">₹</div>
            <h3>No transactions yet</h3>
            <p>
              Your income and expenses will appear here once you
              start recording transactions.
            </p>
          </div>
        ) : (
          <div className="recent-table-wrapper">
            <table className="recent-transactions-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th className="amount-column">Amount</th>
                </tr>
              </thead>

              <tbody>
                {recentTransactions.map((transaction) => {
                  const isIncome = transaction.type === "income";
                  const amount = getAmount(transaction);
                  const subcategory = getSubcategory(transaction);

                  return (
                    <tr key={transaction.id}>
                      <td>
                        <div className="transaction-title-cell">
                          <div className={`transaction-avatar ${
                            isIncome ? "avatar-income" : "avatar-expense"
                          }`}>
                            {isIncome ? "↗" : "↘"}
                          </div>

                          <div className="transaction-title-info">
                            <strong>
                              {transaction.title ||
                                transaction.description ||
                                "Untitled transaction"}
                            </strong>

                            {transaction.notes && (
                              <span>{transaction.notes}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="category-cell">
                          <strong>{getCategory(transaction)}</strong>

                          {subcategory && (
                            <span>{subcategory}</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="transaction-date">
                          {formatDate(
                            transaction.transaction_date ||
                            transaction.date
                          )}
                        </span>
                      </td>

                      <td>
                        <span className={`transaction-type ${
                          isIncome ? "type-income" : "type-expense"
                        }`}>
                          {isIncome ? "Income" : "Expense"}
                        </span>
                      </td>

                      <td className={`amount-column ${
                        isIncome ? "text-income" : "text-expense"
                      }`}>
                        <strong>
                          {isIncome ? "+" : "-"} ₹{formatAmount(amount)}
                        </strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}

export default Dashboard;
