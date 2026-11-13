
import { useMemo, useState, memo, useEffect } from "react";
import { Filter, Pencil, Trash2, Search } from "lucide-react";
import DateRangePicker from "../common/DateRangePicker";
import InfoModal from "../Modal/InfoModal";
import NotesCell from "../Modal/NotesCell";
import "./TransactionsTable.css";

function formatAmount(amount, type) {
  const value = Number(amount) || 0;

  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return type === "income" ? `+${formatted}` : `-${formatted}`;
}

// Convert a date into YYYY-MM-DD without timezone shifting.
function toDateKey(value) {
  if (!value) return "";

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date) {
  const dateKey = toDateKey(date);

  if (!dateKey) return "—";

  const [year, month, day] = dateKey.split("-");

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return `${day} ${monthNames[Number(month) - 1]} ${year}`;
}

function TransactionsTable({
  title = "Your Daily Transactions",
  transactions = [],
  onEdit,
  onDelete,
  years = [],
  months = [],
  selectedYear,
  selectedMonthNumber,
  onYearChange,
  onMonthChange,
  onCurrentMonth,
  isCurrentMonth,
}) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const ITEMS_PER_PAGE = 10;

  const [currentPage, setCurrentPage] = useState(1);


  const filteredTransactions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();


    return transactions.filter((transaction) => {
      // Search filter
      const matchesSearch =
        !search ||
        [
          transaction.title,
          transaction.category,
          transaction.subcategory,
          transaction.notes,
          transaction.amount,
          formatAmount(transaction.amount, transaction.type),
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(search)
        );

      // Type filter
      const matchesType =
        !typeFilter || transaction.type === typeFilter;

      // Date filter
      const dateKey = toDateKey(transaction.date);

      const matchesFrom =
        !fromDate || (dateKey && dateKey >= fromDate);

      const matchesTo =
        !toDate || (dateKey && dateKey <= toDate);

      return matchesSearch && matchesType && matchesFrom && matchesTo;
    });
  }, [transactions, searchTerm, fromDate, toDate, typeFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setTypeFilter("");
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() || fromDate || toDate || typeFilter
  );

  // Calculate pagination
  const totalPages = Math.ceil(
    filteredTransactions.length / ITEMS_PER_PAGE
  );

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, fromDate, toDate, typeFilter]);

  // Keep current page valid when transactions are deleted
  useEffect(() => {
    setCurrentPage((current) =>
      Math.min(current, Math.max(totalPages, 1))
    );
  }, [totalPages]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const startRecord =
    filteredTransactions.length === 0 ? 0 : startIndex + 1;

  const endRecord = Math.min(
    startIndex + ITEMS_PER_PAGE,
    filteredTransactions.length
  );

  console.log("Tran : ", transactions)

  return (
    <section className="transactions-section">
      <div className="transactions-header">
        <h2 className="transactions-title">{title}</h2>
        {/* Current Month */}
        <button
          type="button"
          className="current-month-button"
          onClick={onCurrentMonth}
          disabled={isCurrentMonth}
        >
          Current Month
        </button>

        <div className="transactions-filters">


          {/* Year Filter */}
          <div className="filter-card filter-card-year">
            <div className="filter-card-label">
              <span>Year</span>
            </div>

            <select
              value={selectedYear}
              onChange={(event) => onYearChange(event.target.value)}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="filter-card filter-card-month">
            <div className="filter-card-label">
              <span>Month</span>
            </div>

            <select
              value={selectedMonthNumber}
              onChange={(event) => onMonthChange(event.target.value)}
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>



          {/* Search */}
          <div className="filter-card filter-card-search">
            <div className="filter-card-label">
              <Search size={15} />
              <span>Search</span>
            </div>

            <input
              type="search"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search transactions"
            />
          </div>

          {/* Date Range */}
          {/* <div className="filter-card filter-card-range">
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
          </div> */}

          {/* Type Filter */}
          <div className="filter-card filter-card-type">
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

          {/* Clear Filters */}
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
              <th>Payment Type</th>
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
              paginatedTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{formatDisplayDate(transaction.date)}</td>

                  <td>
                    <span
                      className={`type-badge type-${transaction.type}`}
                    >
                      {transaction.type === "income" ? "Income" : "Expense"}
                    </span>
                  </td>
                  <td>{transaction.paymentMode ? transaction.paymentMode : transaction.payment_mode || "-"}</td>
                  <td>{transaction.category || "—"}</td>
                  <td>{transaction.subcategory || "—"}</td>
                  <td>{transaction.title || "—"}</td>
                  <td className="notes-cell">
                    <NotesCell
                      notes={transaction.notes}
                      onView={setSelectedNote}
                    />
                  </td>

                  <td className={`text-right amount-${transaction.type}`}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </td>

                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="icon-action-button edit"
                        aria-label={`Edit ${transaction.title || "transaction"}`}
                        title="Edit"
                        onClick={() => onEdit?.(transaction)}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        className="icon-action-button delete"
                        aria-label={`Delete ${transaction.title || "transaction"}`}
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
      {totalPages > 1 && (
        <div className="pagination-container">

          <div className="pagination-info">
            Showing <strong>{startRecord}</strong> to{" "}
            <strong>{endRecord}</strong> of{" "}
            <strong>{filteredTransactions.length}</strong> transactions
          </div>

          <div className="pagination-controls">

            <button
              type="button"
              className="pagination-button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) => Math.max(page - 1, 1))
              }
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  className={`pagination-button ${currentPage === page ? "active" : ""
                    }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              )
            )}

            <button
              type="button"
              className="pagination-button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(page + 1, totalPages)
                )
              }
            >
              Next
            </button>

          </div>
        </div>
      )}

      <InfoModal
        isOpen={selectedNote !== null}
        onClose={() => setSelectedNote(null)}
        title="Transaction Notes"
        maxWidth="500px"
        footer={
          <button
            type="button"
            className="popup-close-button"
            onClick={() => setSelectedNote(null)}
          >
            Close
          </button>
        }
      >
        <div className="notes-modal-content">
          {selectedNote}
        </div>
      </InfoModal>

    </section>
  );
}

export default memo(TransactionsTable);
