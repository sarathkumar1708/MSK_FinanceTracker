
import { useEffect, useMemo, useState, useCallback } from "react";
import { Suspense } from "react";

import PageHeader from "../../../components/common/PageHeader";
import Button from "../../../components/common/Button";
import { transactionService } from "../../../services/transactionService";

import {
  TransactionsTable,
  TransactionFormModal,
} from "../../../utils/lazyComponents";

import "./DailySpendingPage.css";
import { MONTHS } from "../../../data/data";

function formatTotal(amount) {
  return Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentMonth() {
  return getLocalDateKey().slice(0, 7);
}

function getMonthRange(selectedMonth) {
  const [year, month] = selectedMonth.split("-").map(Number);

  const startDate = `${selectedMonth}-01`;

  const nextMonth = new Date(year, month, 1);

  const endDate = `${nextMonth.getFullYear()}-${String(
    nextMonth.getMonth() + 1
  ).padStart(2, "0")}-01`;

  return { startDate, endDate };
}

function DailySpendingPage() {
  const [transactions, setTransactions] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const [modalType, setModalType] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Year and month selection
  const currentYear = new Date().getFullYear();

  const [selectedYear, selectedMonthNumber] = selectedMonth.split("-");

  const years = Array.from(
    { length: currentYear - 2000 + 3 },
    (_, index) => currentYear + 2 - index
  );

  // Fetch transactions whenever the selected month changes.
  useEffect(() => {
    let active = true;

    const loadTransactions = async () => {
      try {
        setLoading(true);
        setError("");

        const { startDate, endDate } = getMonthRange(selectedMonth);

        const data = await transactionService.getAll({
          startDate,
          endDate,
        });

        if (active) {
          setTransactions(data);
        }
      } catch (err) {
        console.error("Failed to fetch transactions:", err);

        if (active) {
          setError(err.message || "Unable to load transactions.");
          setTransactions([]);
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
  }, [selectedMonth]);

  // Calculate totals for the selected month.

  const {
    totalIncome,
    totalExpense,
    totalBalance,
    paymentModeTotals
  } = useMemo(() => {
    const totals = {
      totalIncome: 0,
      totalExpense: 0,
      paymentModeTotals: {
        Cash: 0,
        Netbanking: 0,
        Upi: 0,
        CreditCard: 0
      }
    };

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount) || 0;

      if (transaction.type === "income") {
        totals.totalIncome += amount;
      } else if (transaction.type === "expense") {
        totals.totalExpense += amount;

        const paymentMode =
          transaction.paymentMode ||
          transaction.payment_mode;

        if (paymentMode && paymentMode in totals.paymentModeTotals) {
          totals.paymentModeTotals[paymentMode] += amount;
        }
      }
    });

    return {
      ...totals,
      totalBalance: totals.totalIncome - totals.totalExpense
    };
  }, [transactions]);


  const balanceTone =
    totalBalance > 0
      ? "positive"
      : totalBalance < 0
        ? "negative"
        : "neutral";

  const closeModal = useCallback(() => {
    setModalType(null);
    setEditingTransaction(null);
  }, []);

  const openCreateModal = useCallback((type) => {
    setEditingTransaction(null);
    setModalType(type);
  }, []);

  const handleEdit = useCallback((transaction) => {
    setEditingTransaction(transaction);
    setModalType(transaction.type || "expense");
  }, []);

  const handleDelete = useCallback(async (transaction) => {
    try {
      setError("");

      await transactionService.delete(transaction.id);

      setTransactions((current) =>
        current.filter((item) => item.id !== transaction.id)
      );
    } catch (err) {
      console.error("Delete transaction failed:", err);
      setError(err.message || "Unable to delete transaction.");
    }
  }, []);

  // Create or update a transaction.
  const handleSave = async (entry) => {
    try {
      setSaving(true);
      setError("");

      if (editingTransaction) {
        await transactionService.update(editingTransaction.id, entry);
      } else {
        await transactionService.create(entry);
      }

      // Refresh the currently selected month's transactions.
      const { startDate, endDate } = getMonthRange(selectedMonth);

      const updatedTransactions = await transactionService.getAll({
        startDate,
        endDate,
      });

      setTransactions(updatedTransactions);

      closeModal();
    } catch (err) {
      console.error("Save transaction failed:", err);
      setError(err.message || "Unable to save transaction.");
    } finally {
      setSaving(false);
    }
  };

  // Current month defaults to today.
  // Previous months default to the first day of that month.
  const defaultTransactionDate =
    selectedMonth === getCurrentMonth()
      ? getLocalDateKey()
      : `${selectedMonth}-01`;

  // Keep the initial value stable while the modal is open.
  const newTransactionInitial = useMemo(
    () => ({
      date: defaultTransactionDate,
    }),
    [defaultTransactionDate]
  );

  return (
    <div className="page-container">
      <PageHeader
        title="Daily Spending"
        description="Manage your daily expenses and transactions."
        icon="Wallet"
      />

      <div className="content-card daily-spending-card">

        {/* Year and Month Selection */}
        {/* <div className="spending-month-selector">

          <div>
            <label htmlFor="spending-year">Year</label>

            <select
              id="spending-year"
              value={selectedYear}
              onChange={(event) => {
                setSelectedMonth(
                  `${event.target.value}-${selectedMonthNumber}`
                );
              }}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="spending-month">Month</label>

            <select
              id="spending-month"
              value={selectedMonthNumber}
              onChange={(event) => {
                setSelectedMonth(
                  `${selectedYear}-${event.target.value}`
                );
              }}
            >
              {MONTHS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="current-month-button"
            onClick={() => setSelectedMonth(getCurrentMonth())}
            disabled={selectedMonth === getCurrentMonth()}
          >
            Current Month
          </button>

        </div> */}

        {/* Action Buttons and Totals */}
        <div className="action-bar">
          <div className="action-bar-left">
            <div className="action-buttons">
              <Button
                variant="danger"
                onClick={() => openCreateModal("expense")}
              >
                Add Expense
              </Button>

              <Button
                variant="success"
                onClick={() => openCreateModal("income")}
              >
                Add Income
              </Button>
            </div>
          </div>

          <div className="transaction-totals">
            <div className="total-pill total-income">
              <span>Total Income</span>
              <strong>{formatTotal(totalIncome)}</strong>
            </div>

            <div className="total-pill total-expense">
              <span>Total Expense</span>
              <strong>{formatTotal(totalExpense)}</strong>
            </div>

            <div className={`total-pill total-balance ${balanceTone}`}>
              <span>Total Balance</span>
              <strong>{formatTotal(totalBalance)}</strong>
            </div>
          </div>
        </div>


        {/* Payment Mode Summary - Above Action Bar */}
        <div className="paymode-section">
          <div className="paymode-flow">
            <div className="paymode-heading">
              <span>Expense by Payment Mode</span>
              <small>Selected month</small>
            </div>

            <div className="paymode-cards">
              <div className="expense-paymode-cash">
                <span>Cash</span>
                <strong>{formatTotal(paymentModeTotals.Cash)}</strong>
              </div>

              <div className="expense-paymode-netbanking">
                <span>Net Banking</span>
                <strong>{formatTotal(paymentModeTotals.Netbanking)}</strong>
              </div>

              <div className="expense-paymode-upi">
                <span>UPI</span>
                <strong>{formatTotal(paymentModeTotals.Upi)}</strong>
              </div>

              <div className="expense-paymode-creditcard">
                <span>Credit Card</span>
                <strong>{formatTotal(paymentModeTotals.CreditCard)}</strong>
              </div>
            </div>
          </div>
        </div>


        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {/* Transactions Table */}
        {loading ? (
          <p>Loading transactions...</p>
        ) : (
          <Suspense fallback={<p>Loading table...</p>}>
            <TransactionsTable
              title="Your Daily Transactions"
              transactions={transactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
              years={years}
              months={MONTHS}
              selectedYear={selectedYear}
              selectedMonthNumber={selectedMonthNumber}
              onYearChange={(year) =>
                setSelectedMonth(`${year}-${selectedMonthNumber}`)
              }
              onMonthChange={(month) =>
                setSelectedMonth(`${selectedYear}-${month}`)
              }
              onCurrentMonth={() =>
                setSelectedMonth(getCurrentMonth())
              }
              isCurrentMonth={selectedMonth === getCurrentMonth()}
            />
          </Suspense>
        )}

        {/* Transaction Modal */}
        <Suspense fallback={null}>
          <TransactionFormModal
            open={Boolean(modalType)}
            type={modalType || "expense"}
            initialTransaction={
              editingTransaction || newTransactionInitial
            }
            onClose={closeModal}
            onSave={handleSave}
            loading={saving}
          />
        </Suspense>

      </div>
    </div>
  );
}

export default DailySpendingPage;
