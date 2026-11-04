
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import TransactionsTable from "../../components/finance/TransactionsTable";
import TransactionFormModal from "../../components/finance/TransactionFormModal";
import { transactionService } from "../../services/transactionService";

function formatTotal(amount) {
  return Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function DailySpendingPage() {
  const [transactions, setTransactions] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch transactions whenever the page loads
  useEffect(() => {
    let active = true;

    const loadTransactions = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await transactionService.getAll();

        if (active) {
          setTransactions(data);
        }
      } catch (err) {
        console.error("Failed to fetch transactions:", err);

        if (active) {
          setError(err.message || "Unable to load transactions.");
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
  }, []);

  const { totalIncome, totalExpense, totalBalance } = useMemo(() => {
    const totals = transactions.reduce(
      (result, transaction) => {
        const amount = Number(transaction.amount) || 0;

        if (transaction.type === "income") {
          result.totalIncome += amount;
        } else {
          result.totalExpense += amount;
        }

        return result;
      },
      { totalIncome: 0, totalExpense: 0 }
    );

    return {
      ...totals,
      totalBalance: totals.totalIncome - totals.totalExpense,
    };
  }, [transactions]);

  const balanceTone =
    totalBalance > 0
      ? "positive"
      : totalBalance < 0
        ? "negative"
        : "neutral";

  const closeModal = () => {
    setModalType(null);
    setEditingTransaction(null);
  };

  const openCreateModal = (type) => {
    setEditingTransaction(null);
    setModalType(type);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setModalType(transaction.type || "expense");
  };

  // Delete transaction from Supabase
  const handleDelete = async (transaction) => {
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
  };

  // Create or update transaction in Supabase

  const handleSave = async (entry) => {
    try {
      setSaving(true);
      setError("");
  
      if (editingTransaction) {
        await transactionService.update(
          editingTransaction.id,
          entry
        );
      } else {
        await transactionService.create(entry);
      }
  
      // Always retrieve the latest transactions from Supabase.
      const updatedTransactions = await transactionService.getAll();
  
      setTransactions(updatedTransactions);
  
      closeModal();
    } catch (err) {
      console.error("Save transaction failed:", err);
      setError(err.message || "Unable to save transaction.");
    } finally {
      setSaving(false);
    }
  };
  

  return (
    <div className="page-container">
      <PageHeader
        title="Daily Spending"
        description="Manage your daily expenses and transactions."
        icon="Wallet"
      />

      <div className="content-card daily-spending-card">
        <div className="action-bar">
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

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <p>Loading transactions...</p>
        ) : (
          <TransactionsTable
            title="Your Daily Transactions"
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <TransactionFormModal
        open={Boolean(modalType)}
        type={modalType || "expense"}
        initialTransaction={editingTransaction}
        onClose={closeModal}
        onSave={handleSave}
        loading={saving}
      />
    </div>
  );
}

export default DailySpendingPage;
