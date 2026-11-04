import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import TransactionsTable from "../../components/finance/TransactionsTable";
import TransactionFormModal from "../../components/finance/TransactionFormModal";
import {
  createId,
  readTransactions,
  saveTransactions
} from "../../utils/transactionStorage";

function formatTotal(amount) {
  return Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function DailySpendingPage() {
  const [transactions, setTransactions] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    setTransactions(readTransactions());
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
      totalBalance: totals.totalIncome - totals.totalExpense
    };
  }, [transactions]);

  const balanceTone =
    totalBalance > 0 ? "positive" : totalBalance < 0 ? "negative" : "neutral";

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

  const handleDelete = (transaction) => {
    const next = transactions.filter((item) => item.id !== transaction.id);
    setTransactions(next);
    saveTransactions(next);
  };

  const handleSave = (entry) => {
    if (editingTransaction) {
      const next = transactions.map((item) =>
        item.id === editingTransaction.id
          ? {
              ...item,
              ...entry,
              id: item.id,
              date: item.date
            }
          : item
      );

      setTransactions(next);
      saveTransactions(next);
      closeModal();
      return;
    }

    const nextTransaction = {
      id: createId("txn"),
      date: new Date().toISOString().slice(0, 10),
      ...entry
    };

    const next = [nextTransaction, ...transactions];
    setTransactions(next);
    saveTransactions(next);
    closeModal();
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
            <Button variant="danger" onClick={() => openCreateModal("expense")}>
              Add Expense
            </Button>
            <Button variant="success" onClick={() => openCreateModal("income")}>
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

        <TransactionsTable
          title="Your Daily Transactions"
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <TransactionFormModal
        open={Boolean(modalType)}
        type={modalType || "expense"}
        initialTransaction={editingTransaction}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}

export default DailySpendingPage;
