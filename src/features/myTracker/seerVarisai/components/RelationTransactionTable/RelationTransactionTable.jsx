import React, { useMemo } from "react";
import { Pencil, Trash2, Receipt } from "lucide-react";
import "./RelationTransactionTable.css";

const formatDate = (date) => {
    if (!date) return "-";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatCurrency = (minor = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(minor || 0) / 100);

const formatGold = (grams) => {
    const totalGrams = Number(grams || 0);
    const savaran = Math.floor(totalGrams / 8);
    const remainingGrams = Number((totalGrams % 8).toFixed(3));

    if (savaran === 0) return `${remainingGrams} Grams`;
    if (remainingGrams === 0) return `${savaran} Savaran`;

    return `${savaran} Savaran ${remainingGrams} Grams`;
};

const getOfferingDisplay = (item) => {
    const offeringType = item.offering_type || "CASH";

    switch (offeringType) {
        case "GOLD":
            return item.gold_grams != null
                ? formatGold(item.gold_grams)
                : "Gold weight not entered";

        case "DRESS":
            return item.item_count != null
                ? `${item.item_count} item(s)`
                : "Count not entered";

        case "SILVER":
            return item.amount_minor != null
                ? formatCurrency(item.amount_minor)
                : "Amount not entered";

        case "CASH":
        default:
            return item.amount_minor != null
                ? formatCurrency(item.amount_minor)
                : "Amount not entered";
    }
};

function RelationTransactionTable({
    title,
    transactions = [],
    type,
    onEdit,
    onDelete,
}) {
    const isReceived = type === "RELATIONS_SPENT";

    const sortedTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => {
            const dateComparison = (b.transaction_date || "").localeCompare(
                a.transaction_date || ""
            );

            if (dateComparison !== 0) return dateComparison;

            return (
                new Date(b.created_at || 0).getTime() -
                new Date(a.created_at || 0).getTime()
            );
        });
    }, [transactions]);

    return (
        <section
            className={`sv-transaction-section ${isReceived ? "received-section" : "paid-section"
                }`}
        >
            <div className="sv-transaction-section-header">
                <div className="sv-transaction-section-icon">
                    <Receipt size={19} />
                </div>

                <div>
                    <h3>{title}</h3>
                    <p>{sortedTransactions.length} transaction(s)</p>
                </div>
            </div>

            {sortedTransactions.length === 0 ? (
                <div className="sv-transaction-empty">
                    <Receipt size={28} />
                    <p>No transactions recorded yet.</p>
                </div>
            ) : (
                <div className="sv-transaction-table-wrap">
                    <table className="sv-transaction-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Details</th>
                                <th>Type</th>
                                <th>Value</th>
                                <th>Remarks</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {sortedTransactions.map((item) => (
                                <tr key={item.id}>
                                    <td>{formatDate(item.transaction_date)}</td>

                                    <td>
                                        <strong>{item.title}</strong>
                                    </td>

                                    <td>
                                        <span
                                            className={`sv-offering-badge ${(
                                                item.offering_type || "CASH"
                                            ).toLowerCase()}`}
                                        >
                                            {item.offering_type || "CASH"}
                                        </span>
                                    </td>

                                    <td className="sv-transaction-amount">
                                        {getOfferingDisplay(item)}
                                    </td>

                                    <td className="sv-transaction-remarks">
                                        {item.remarks || "—"}
                                    </td>

                                    <td>
                                        <div className="sv-table-actions">
                                            <button
                                                type="button"
                                                title="Edit"
                                                onClick={() => onEdit(item)}
                                            >
                                                <Pencil size={15} />
                                            </button>

                                            <button
                                                type="button"
                                                title="Delete"
                                                onClick={() => onDelete(item)}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

export default RelationTransactionTable;