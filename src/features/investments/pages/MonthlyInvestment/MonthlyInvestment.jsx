
import { useMemo, useState } from "react";
import { Plus, TrendingUp, TrendingDown, Wallet, Save, Pencil, Trash2, X } from "lucide-react";

import {
    InvestmentPageHeader,
    InvestmentSection,
    formatCurrency,
} from "../../components/InvestmentShared/InvestmentShared";

import "./MonthlyInvestment.css";

const getCurrentMonth = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(
        date.getMonth() + 1
    ).padStart(2, "0")}`;
};

const INITIAL_TRANSACTION = {
    transaction_type: "CONTRIBUTION",
    amount: "",
    transaction_date: new Date().toISOString().slice(0, 10),
    notes: "",
};

export default function MonthlyInvestment({
    investments = [],
    transactions = [],
    monthlySnapshots = [],
    loading = false,
    transactionSaving = false,
    snapshotSaving = false,
    onCreateTransaction,
    onSaveSnapshot,
    onUpdateTransaction,
    onDeleteTransaction,
}) {
    const [selectedMonth, setSelectedMonth] =
        useState(getCurrentMonth());

    const [selectedInvestmentId, setSelectedInvestmentId] =
        useState("");

    const [transactionForm, setTransactionForm] =
        useState(INITIAL_TRANSACTION);

    const [editingTransaction, setEditingTransaction] = useState(null);

    const [valuation, setValuation] = useState("");
    const [valuationNotes, setValuationNotes] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const activeInvestments = useMemo(
        () =>
            investments.filter(
                (investment) => investment.status !== "closed"
            ),
        [investments]
    );

    const selectedInvestment = activeInvestments.find(
        (investment) => investment.id === selectedInvestmentId
    );

    const monthTransactions = useMemo(() => {
        if (!selectedInvestmentId) return [];

        return transactions
            .filter((transaction) => {
                const transactionMonth =
                    transaction.transaction_date?.slice(0, 7);

                return (
                    transaction.investment_id === selectedInvestmentId &&
                    transactionMonth === selectedMonth
                );
            })
            .sort(
                (a, b) =>
                    new Date(a.transaction_date) -
                    new Date(b.transaction_date)
            );
    }, [transactions, selectedInvestmentId, selectedMonth]);

    const monthTotals = useMemo(() => {
        return monthTransactions.reduce(
            (totals, transaction) => {
                const amount = Number(transaction.amount || 0);

                if (transaction.transaction_type === "CONTRIBUTION") {
                    totals.contributions += amount;
                } else if (
                    transaction.transaction_type === "WITHDRAWAL"
                ) {
                    totals.withdrawals += amount;
                }

                return totals;
            },
            { contributions: 0, withdrawals: 0 }
        );
    }, [monthTransactions]);

    const selectedSnapshot = useMemo(() => {
        if (!selectedInvestmentId) return null;

        return monthlySnapshots.find(
            (snapshot) =>
                snapshot.investment_id === selectedInvestmentId &&
                snapshot.month?.slice(0, 7) === selectedMonth
        );
    }, [monthlySnapshots, selectedInvestmentId, selectedMonth]);

    const latestSnapshot = useMemo(() => {
        if (!selectedInvestmentId) return null;

        return monthlySnapshots
            .filter(
                (snapshot) =>
                    snapshot.investment_id === selectedInvestmentId
            )
            .sort(
                (a, b) => new Date(b.month) - new Date(a.month)
            )[0];
    }, [monthlySnapshots, selectedInvestmentId]);

    const displayedValue =
        selectedSnapshot?.current_market_value ??
        selectedSnapshot?.closing_balance ??
        latestSnapshot?.current_market_value ??
        latestSnapshot?.closing_balance ??
        0;

    const handleInvestmentChange = (event) => {
        setSelectedInvestmentId(event.target.value);
        setValuation("");
        setValuationNotes("");
        setMessage("");
        setError("");
    };

    const handleTransactionChange = (event) => {
        const { name, value } = event.target;

        setTransactionForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    const resetTransactionForm = () => {
        setEditingTransaction(null);
        setTransactionForm({
            transaction_type: "CONTRIBUTION",
            amount: "",
            transaction_date: `${selectedMonth}-01`,
            notes: "",
        });
    };

    const handleAddTransaction = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!selectedInvestmentId) {
            setError("Please select an investment.");
            return;
        }

        const amount = Number(transactionForm.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            setError("Enter an amount greater than zero.");
            return;
        }

        if (transactionForm.transaction_date.slice(0, 7) !== selectedMonth) {
            setError("Transaction date must belong to the selected month.");
            return;
        }

        const payload = {
            investment_id: selectedInvestmentId,
            transaction_type: transactionForm.transaction_type,
            amount,
            transaction_date: transactionForm.transaction_date,
            notes: transactionForm.notes.trim() || null,
        };

        try {
            if (editingTransaction) {
                await onUpdateTransaction(editingTransaction.id, payload);
                setMessage("Transaction updated successfully.");
            } else {
                await onCreateTransaction(payload);
                setMessage("Transaction added successfully.");
            }

            resetTransactionForm();
        } catch (err) {
            console.error("Investment transaction save error:", err);

            const errorMessage =
                typeof err === "string"
                    ? err
                    : err?.message ||
                    err?.details ||
                    err?.payload ||
                    "Unable to save this transaction.";

            setError(errorMessage);
        }
    };

    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction);

        setTransactionForm({
            transaction_type: transaction.transaction_type,
            amount: transaction.amount,
            transaction_date: transaction.transaction_date,
            notes: transaction.notes || "",
        });

        setMessage("");
        setError("");
    };

    const handleDeleteTransaction = async (transaction) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this transaction?"
        );

        if (!confirmed) return;

        setError("");
        setMessage("");

        try {
            await onDeleteTransaction(transaction.id);

            if (editingTransaction?.id === transaction.id) {
                resetTransactionForm();
            }

            setMessage("Transaction deleted successfully.");
        } catch (err) {
            setError(err?.message || "Unable to delete this transaction.");
        }
    };


    const handleSaveValuation = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        const currentValue = Number(valuation);

        if (!Number.isFinite(currentValue) || currentValue < 0) {
            setError("Enter a valid current value.");
            return;
        }

        try {
            await onSaveSnapshot({
                investment_id: selectedInvestmentId,
                month: `${selectedMonth}-01`,
                current_market_value: currentValue,
                notes: valuationNotes.trim() || null,
            });

            setValuation("");
            setValuationNotes("");
            setMessage("Monthly investment value saved successfully.");
        } catch (err) {
            setError(
                err?.message || "Unable to save the monthly value."
            );
        }
    };

    return (
        <div className="monthly-investment-page">
            <InvestmentPageHeader
                title="Monthly Investment"
                description="Record contributions, withdrawals and monthly investment values."
                showButton={false}
            />

            <InvestmentSection
                title={
                    editingTransaction
                        ? "Edit Investment Transaction"
                        : "Add Investment Transaction"
                }
                description="Record or correct a contribution or withdrawal."
            >
                <div className="monthly-investment-filters">
                    <div>
                        <label>Month</label>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(event) => {
                                setSelectedMonth(event.target.value);
                                setTransactionForm((previous) => ({
                                    ...previous,
                                    transaction_date: `${event.target.value}-01`,
                                }));
                                setMessage("");
                                setError("");
                            }}
                        />
                    </div>

                    <div>
                        <label>Investment</label>
                        <select
                            value={selectedInvestmentId}
                            onChange={handleInvestmentChange}
                        >
                            <option value="">Select Investment</option>

                            {activeInvestments.map((investment) => (
                                <option
                                    key={investment.id}
                                    value={investment.id}
                                >
                                    {investment.name} (
                                    {investment.investment_type})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </InvestmentSection>

            {!selectedInvestmentId ? (
                <div className="monthly-investment-empty">
                    <Wallet size={30} />
                    <p>Select an investment to view its monthly details.</p>
                </div>
            ) : loading ? (
                <div className="monthly-investment-empty">
                    Loading investment details...
                </div>
            ) : (
                <>
                    <div className="monthly-investment-summary">
                        <div className="monthly-summary-card">
                            <span>Current Value</span>
                            <strong>{formatCurrency(displayedValue)}</strong>
                        </div>

                        <div className="monthly-summary-card contribution">
                            <span>Monthly Contributions</span>
                            <strong>
                                {formatCurrency(monthTotals.contributions)}
                            </strong>
                        </div>

                        <div className="monthly-summary-card withdrawal">
                            <span>Monthly Withdrawals</span>
                            <strong>
                                {formatCurrency(monthTotals.withdrawals)}
                            </strong>
                        </div>

                        <div className="monthly-summary-card">
                            <span>Net Monthly Change</span>
                            <strong>
                                {formatCurrency(
                                    monthTotals.contributions -
                                    monthTotals.withdrawals
                                )}
                            </strong>
                        </div>
                    </div>

                    <InvestmentSection
                        title="Add Investment Transaction"
                        description={`Record a contribution or withdrawal for ${selectedInvestment?.name || "this investment"}.`}
                    >
                        <form
                            className="monthly-transaction-form"
                            onSubmit={handleAddTransaction}
                        >
                            <div>
                                <label>Transaction Type</label>
                                <select
                                    name="transaction_type"
                                    value={transactionForm.transaction_type}
                                    onChange={handleTransactionChange}
                                >
                                    <option value="CONTRIBUTION">
                                        Contribution
                                    </option>
                                    <option value="WITHDRAWAL">
                                        Withdrawal
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label>Amount (₹)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    min="0.01"
                                    step="0.01"
                                    value={transactionForm.amount}
                                    onChange={handleTransactionChange}
                                    placeholder="Enter amount"
                                    required
                                />
                            </div>

                            <div>
                                <label>Date</label>
                                <input
                                    type="date"
                                    name="transaction_date"
                                    value={transactionForm.transaction_date}
                                    onChange={handleTransactionChange}
                                    required
                                />
                            </div>

                            <div>
                                <label>Notes</label>
                                <input
                                    name="notes"
                                    value={transactionForm.notes}
                                    onChange={handleTransactionChange}
                                    placeholder="Optional notes"
                                />
                            </div>

                            <button type="submit" disabled={transactionSaving}>
                                {editingTransaction ? <Save size={16} /> : <Plus size={16} />}

                                {transactionSaving
                                    ? "Saving..."
                                    : editingTransaction
                                        ? "Update Transaction"
                                        : "Add Transaction"}
                            </button>

                            {editingTransaction && (
                                <button
                                    type="button"
                                    className="monthly-cancel-edit-btn"
                                    onClick={resetTransactionForm}
                                    disabled={transactionSaving}
                                >
                                    <X size={16} />
                                    Cancel Edit
                                </button>
                            )}
                        </form>
                    </InvestmentSection>

                    <InvestmentSection
                        title="Monthly Transactions"
                        description="All contributions and withdrawals recorded for this investment and month."
                    >
                        {monthTransactions.length === 0 ? (
                            <div className="monthly-investment-empty">
                                No transactions recorded for this month.
                            </div>
                        ) : (
                            <div className="monthly-transaction-table-wrap">
                                <table className="monthly-transaction-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Amount</th>
                                            <th>Notes</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {monthTransactions.map((transaction) => {
                                            const isContribution =
                                                transaction.transaction_type ===
                                                "CONTRIBUTION";

                                            return (
                                                <tr key={transaction.id}>
                                                    <td>
                                                        {new Date(
                                                            transaction.transaction_date
                                                        ).toLocaleDateString(
                                                            "en-IN"
                                                        )}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`monthly-transaction-badge ${isContribution
                                                                ? "contribution"
                                                                : "withdrawal"
                                                                }`}
                                                        >
                                                            {isContribution ? (
                                                                <TrendingUp size={14} />
                                                            ) : (
                                                                <TrendingDown size={14} />
                                                            )}
                                                            {isContribution
                                                                ? "Contribution"
                                                                : "Withdrawal"}
                                                        </span>
                                                    </td>

                                                    <td
                                                        className={
                                                            isContribution
                                                                ? "monthly-amount-positive"
                                                                : "monthly-amount-negative"
                                                        }
                                                    >
                                                        {formatCurrency(
                                                            transaction.amount
                                                        )}
                                                    </td>

                                                    <td>
                                                        {transaction.notes || "—"}
                                                    </td>
                                                    <td>{transaction.notes || "—"}</td>

                                                    <td>
                                                        <div className="monthly-transaction-actions">
                                                            <button
                                                                type="button"
                                                                title="Edit transaction"
                                                                onClick={() => handleEditTransaction(transaction)}
                                                            >
                                                                <Pencil size={15} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                title="Delete transaction"
                                                                className="delete"
                                                                onClick={() => handleDeleteTransaction(transaction)}
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </InvestmentSection>

                    <InvestmentSection
                        title="Monthly Valuation Update"
                        description="Enter the latest value or balance shown by your bank, provider or investment platform."
                    >
                        <form
                            className="monthly-valuation-form"
                            onSubmit={handleSaveValuation}
                        >
                            <div>
                                <label>Current Value / Balance (₹)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={valuation}
                                    onChange={(event) =>
                                        setValuation(event.target.value)
                                    }
                                    placeholder={`Current value: ${formatCurrency(displayedValue)}`}
                                    required
                                />
                            </div>

                            <div>
                                <label>Notes</label>
                                <input
                                    value={valuationNotes}
                                    onChange={(event) =>
                                        setValuationNotes(event.target.value)
                                    }
                                    placeholder="Example: November bank statement"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={snapshotSaving}
                            >
                                <Save size={16} />
                                {snapshotSaving
                                    ? "Saving..."
                                    : "Save Monthly Value"}
                            </button>
                        </form>
                    </InvestmentSection>
                </>
            )}

            {error && (
                <div className="monthly-investment-message error">
                    {error}
                </div>
            )}

            {message && (
                <div className="monthly-investment-message success">
                    {message}
                </div>
            )}
        </div>
    );
}
