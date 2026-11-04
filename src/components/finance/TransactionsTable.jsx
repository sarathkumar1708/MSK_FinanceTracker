import { useMemo, useState } from "react";
import { Filter, Pencil, Trash2 } from "lucide-react";
import DateRangePicker from "../common/DateRangePicker";

function formatAmount(amount, type) {
  const value = Number(amount) || 0;
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return type === "income" ? `+${formatted}` : `-${formatted}`;
}

function toDateKey(value) {
  if (!value) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const formatDisplayDate = (date) => {
  if (!date) return "";

  const [year, month, day] = date.split("-");

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return `${day} ${monthNames[Number(month) - 1]} ${year}`;
};

function TransactionsTable({
  title = "Your Daily Transactions",
  transactions = [],
  onEdit,
  onDelete
}) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesType = !typeFilter || transaction.type === typeFilter;
      const dateKey = toDateKey(transaction.date);

      const matchesFrom = !fromDate || (dateKey && dateKey >= fromDate);
      const matchesTo = !toDate || (dateKey && dateKey <= toDate);

      return matchesType && matchesFrom && matchesTo;
    });
  }, [transactions, fromDate, toDate, typeFilter]);

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setTypeFilter("");
  };

  const hasActiveFilters = Boolean(fromDate || toDate || typeFilter);

  return (
    <section className="transactions-section">
      <div className="transactions-header">
        <h2 className="transactions-title">{title}</h2>

        <div className="transactions-filters">
          <div className="filter-card filter-card-range">
            <div className="filter-card-label">
              <span>Date range</span>
            </div>
            <DateRangePicker
              fromDate={fromDate}
              toDate={toDate}
              onChange={({ fromDate: nextFrom, toDate: nextTo }) => {
                setFromDate(nextFrom);
                setToDate(nextTo);
              }}
            />
          </div>

          <div className="filter-card">
            <div className="filter-card-label">
              <Filter size={15} />
              <span>Type</span>
            </div>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="filter-clear-button"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>SubCategory</th>
              <th>Title</th>
              <th>Notes</th>
              <th className="text-right">Amount</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-empty">
                  {transactions.length === 0
                    ? "No transactions saved yet. Add an expense or income to get started."
                    : "No transactions match the selected filters."}
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{formatDisplayDate(transaction.date)}</td>
                  <td>
                    <span className={`type-badge type-${transaction.type}`}>
                      {transaction.type === "income" ? "Income" : "Expense"}
                    </span>
                  </td>
                  <td>{transaction.category}</td>
                  <td>{transaction.subcategory}</td>
                  <td>{transaction.title}</td>
                  <td>{transaction.notes || "—"}</td>
                  <td className={`text-right amount-${transaction.type}`}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="icon-action-button edit"
                        aria-label={`Edit ${transaction.title}`}
                        title="Edit"
                        onClick={() => onEdit?.(transaction)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-action-button delete"
                        aria-label={`Delete ${transaction.title}`}
                        title="Delete"
                        onClick={() => onDelete?.(transaction)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default TransactionsTable;
