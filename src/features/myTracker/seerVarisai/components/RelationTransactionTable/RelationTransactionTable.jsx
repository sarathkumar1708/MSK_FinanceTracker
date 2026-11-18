import React, { useMemo } from "react";
import { Pencil, Trash2, Receipt } from "lucide-react";

import "./RelationTransactionTable.css";

const formatDate = (date) => {
    if (!date) return "—";

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

const formatGold = (grams = 0) => {
    const total = Number(grams || 0);
    const savaran = Math.floor(total / 8);
    const remaining = Number((total % 8).toFixed(3));

    if (!savaran) return `${remaining} Grams`;
    if (!remaining) return `${savaran} Savaran`;

    return `${savaran} Savaran ${remaining} Grams`;
};

export const getTransactionOfferings = (transaction) => {
    if (Array.isArray(transaction.offerings) && transaction.offerings.length) {
        return transaction.offerings;
    }

    return [{
        offering_type: transaction.offering_type || "CASH",
        amount_minor: transaction.amount_minor,
        gold_grams: transaction.gold_grams,
        item_count: transaction.item_count,
    }];
};

const OFFERING_LABELS = {
    CASH: "Cash",
    GOLD: "Gold",
    SILVER: "Silver",
    DRESS: "Dress",
    THATTUVARISAI: "Thattuvarisai",
};

const getOfferingDisplay = (offering) => {
    switch (offering.offering_type) {
        case "CASH":
            return formatCurrency(offering.amount_minor);

        case "SILVER":
            return formatCurrency(offering.amount_minor);

        case "GOLD":
            return formatGold(offering.gold_grams);

        case "DRESS":
        case "THATTUVARISAI":
            return `${Number(offering.item_count || 0)} item(s)`;

        default:
            return "—";
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

    const sortedTransactions = useMemo(
        () =>
            [...transactions].sort((a, b) => {
                const dateDifference =
                    new Date(b.transaction_date || 0) -
                    new Date(a.transaction_date || 0);

                if (dateDifference !== 0) return dateDifference;

                return new Date(b.created_at || 0) - new Date(a.created_at || 0);
            }),
        [transactions]
    );

    return (
        <div className="sv-transaction-table-card">
            <div className="sv-transaction-table-heading">
                <div className="sv-table-heading-icon">
                    <Receipt size={19} />
                </div>

                <div>
                    <h3>{title}</h3>
                    <p>{sortedTransactions.length} transaction(s) found</p>
                </div>
            </div>

            {sortedTransactions.length === 0 ? (
                <div className="sv-transaction-empty">
                    <div className="sv-empty-icon">
                        <Receipt size={25} />
                    </div>
                    <h3>No transactions found</h3>
                    <p>Transactions matching your selection will appear here.</p>
                </div>
            ) : (
                <div className="sv-transaction-table-wrap">
                    <table className="sv-transaction-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Details</th>
                                <th>Offering Type</th>
                                <th>Value</th>
                                <th>Remarks</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {sortedTransactions.map((transaction) => {
                                const offerings = getTransactionOfferings(transaction);

                                return (
                                    <tr key={transaction.id}>
                                        <td className="sv-transaction-date">
                                            {formatDate(transaction.transaction_date)}
                                        </td>

                                        <td className="sv-transaction-details">
                                            <strong>{transaction.title || "Untitled"}</strong>
                                        </td>

                                        <td>
                                            <div className="sv-transaction-offering-list">
                                                {offerings.map((offering, index) => {
                                                    const typeName = offering.offering_type || "CASH";
                                                    const className = typeName.toLowerCase();

                                                    return (
                                                        <span
                                                            className={`sv-offering-badge ${className}`}
                                                            key={`${typeName}-${index}`}
                                                        >
                                                            {OFFERING_LABELS[typeName] || typeName}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </td>

                                        <td>
                                            <div className="sv-transaction-values">
                                                {offerings.map((offering, index) => {
                                                    const typeName = offering.offering_type || "CASH";

                                                    return (
                                                        <div
                                                            className="sv-transaction-value-line"
                                                            key={`${typeName}-value-${index}`}
                                                        >
                                                            {/* <span>{OFFERING_LABELS[typeName] || typeName}</span> */}
                                                            <strong>{getOfferingDisplay(offering)}</strong>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </td>

                                        <td>
                                            <div className="sv-transaction-remarks">
                                                {transaction.remarks || "—"}
                                            </div>
                                        </td>

                                        <td>
                                            <div className="sv-transaction-actions">
                                                <button
                                                    type="button"
                                                    className="sv-transaction-edit"
                                                    onClick={() => onEdit(transaction)}
                                                    title="Edit transaction"
                                                >
                                                    <Pencil size={15} />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="sv-transaction-delete"
                                                    onClick={() => onDelete(transaction)}
                                                    title="Delete transaction"
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
        </div>
    );
}

export default RelationTransactionTable;