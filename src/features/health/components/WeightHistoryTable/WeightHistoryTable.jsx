
import { useMemo, useState } from "react";
import {
    CalendarDays,
    Edit3,
    Trash2,
    History,
    ArrowDown,
    ArrowUp,
    Minus,
    Search,
} from "lucide-react";

import "./WeightHistoryTable.css";

function formatDate(dateString) {
    if (!dateString) return "-";

    return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatWeight(value) {
    const weight = Number(value);

    return Number.isFinite(weight) ? `${weight.toFixed(2)} kg` : "-";
}

function WeightHistoryTable({
    transactions = [],
    initialWeight = 0,
    onEdit,
    onDelete,
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");

    const sortedTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => {
            const dateComparison = a.update_date.localeCompare(b.update_date);

            if (dateComparison !== 0) {
                return sortOrder === "desc"
                    ? -dateComparison
                    : dateComparison;
            }

            return sortOrder === "desc"
                ? new Date(b.created_at || 0) - new Date(a.created_at || 0)
                : new Date(a.created_at || 0) - new Date(b.created_at || 0);
        });
    }, [transactions, sortOrder]);

    const filteredTransactions = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        if (!term) return sortedTransactions;

        return sortedTransactions.filter((transaction) => {
            const date = formatDate(transaction.update_date).toLowerCase();
            const notes = (transaction.notes || "").toLowerCase();
            const weight = String(transaction.weight);

            return (
                date.includes(term) ||
                notes.includes(term) ||
                weight.includes(term)
            );
        });
    }, [sortedTransactions, searchTerm]);

    const getWeightDifference = (transaction) => {
        const previousTransactions = transactions
            .filter(
                (item) =>
                    item.update_date < transaction.update_date
            )
            .sort((a, b) => b.update_date.localeCompare(a.update_date));

        const previousWeight = previousTransactions.length
            ? Number(previousTransactions[0].weight)
            : Number(initialWeight);

        return Number(transaction.weight) - previousWeight;
    };

    const renderDifference = (difference) => {
        if (difference < 0) {
            return (
                <span className="weight-history-change decrease">
                    <ArrowDown size={14} />
                    {Math.abs(difference).toFixed(2)} kg
                </span>
            );
        }

        if (difference > 0) {
            return (
                <span className="weight-history-change increase">
                    <ArrowUp size={14} />
                    {difference.toFixed(2)} kg
                </span>
            );
        }

        return (
            <span className="weight-history-change unchanged">
                <Minus size={14} />
                0.00 kg
            </span>
        );
    };

    const handleDelete = (transaction) => {
        const confirmed = window.confirm(
            `Delete the weight update recorded on ${formatDate(
                transaction.update_date
            )}?`
        );

        if (confirmed) {
            onDelete?.(transaction);
        }
    };

    return (
        <section className="weight-history-card">
            <div className="weight-history-header">
                <div className="weight-history-title">
                    <div className="weight-history-title-icon">
                        <History size={20} />
                    </div>

                    <div>
                        <h3>Weight History</h3>
                        <p>
                            Review your recorded weight updates
                        </p>
                    </div>
                </div>

                <span className="weight-history-count">
                    {transactions.length} Records
                </span>
            </div>

            <div className="weight-history-toolbar">
                <div className="weight-history-search">
                    <Search size={17} />

                    <input
                        type="text"
                        placeholder="Search date, weight or notes..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                    />
                </div>

                <button
                    type="button"
                    className="weight-history-sort"
                    onClick={() =>
                        setSortOrder((previous) =>
                            previous === "desc" ? "asc" : "desc"
                        )
                    }
                >
                    <CalendarDays size={16} />
                    {sortOrder === "desc" ? "Newest First" : "Oldest First"}
                </button>
            </div>

            <div className="weight-history-table-wrapper">
                <table className="weight-history-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Weight</th>
                            <th>Change</th>
                            <th>Notes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((transaction) => {
                                const difference =
                                    getWeightDifference(transaction);

                                return (
                                    <tr key={transaction.id}>
                                        <td>
                                            <div className="weight-history-date">
                                                <CalendarDays size={15} />
                                                {formatDate(
                                                    transaction.update_date
                                                )}
                                            </div>
                                        </td>

                                        <td>
                                            <span className="weight-history-value">
                                                {formatWeight(
                                                    transaction.weight
                                                )}
                                            </span>
                                        </td>

                                        <td>
                                            {renderDifference(difference)}
                                        </td>

                                        <td>
                                            <span
                                                className="weight-history-notes"
                                                title={transaction.notes || ""}
                                            >
                                                {transaction.notes || "—"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="weight-history-actions">
                                                <button
                                                    type="button"
                                                    className="weight-history-edit"
                                                    title="Edit weight update"
                                                    onClick={() =>
                                                        onEdit?.(transaction)
                                                    }
                                                >
                                                    <Edit3 size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="weight-history-delete"
                                                    title="Delete weight update"
                                                    onClick={() =>
                                                        handleDelete(transaction)
                                                    }
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5">
                                    <div className="weight-history-empty">
                                        <History size={32} />
                                        <h4>
                                            {searchTerm
                                                ? "No matching records"
                                                : "No weight updates yet"}
                                        </h4>
                                        <p>
                                            {searchTerm
                                                ? "Try a different search term."
                                                : "Your weight updates will appear here."}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="weight-history-footer">
                Showing {filteredTransactions.length} of{" "}
                {transactions.length} records
            </div>
        </section>
    );
}

export default WeightHistoryTable;
