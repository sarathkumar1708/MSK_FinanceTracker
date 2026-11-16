
import React, { useMemo, useState } from "react";
import { Edit2, Trash2, Search, Wallet, Gem, Shirt, Gift } from "lucide-react";
import "./EventTransactionTable.css";

const formatCurrency = (minor = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(minor || 0) / 100);

const formatGold = (grams = 0) => {
    const value = Number(grams || 0);
    const savaran = Math.floor(value / 8);
    const remaining = Number((value % 8).toFixed(3));

    if (savaran && remaining) return `${savaran} Savaran ${remaining} g`;
    if (savaran) return `${savaran} Savaran`;
    return `${remaining} g`;
};

const FILTERS = [
    { value: "ALL", label: "All" },
    { value: "CASH", label: "Cash", icon: Wallet },
    { value: "GOLD", label: "Gold", icon: Gem },
    { value: "DRESS", label: "Dress", icon: Shirt },
    { value: "THATTUVARISAI", label: "Thattuvarisai", icon: Gift },
];

const getOfferingLabel = (item) => {
    switch (item.offering_type) {
        case "CASH":
            return `Cash: ${formatCurrency(item.amount_minor)}`;
        case "GOLD":
            return `Gold: ${formatGold(item.gold_grams)}`;
        case "DRESS":
            return `Dress: ${item.item_count || 0}${item.description ? ` (${item.description})` : ""}`;
        case "THATTUVARISAI":
            return `Thattuvarisai: ${item.description || `${item.item_count || 0} Items`}`;
        default:
            return item.offering_type;
    }
};

const EventTransactionTable = ({
    transactions = [],
    onEdit,
    onDelete,
}) => {
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");

    const filteredTransactions = useMemo(() => {
        return transactions.filter((transaction) => {
            const offerings = transaction.my_event_offerings || [];

            const matchesFilter =
                filter === "ALL" ||
                offerings.some((item) => item.offering_type === filter);

            const searchable = [
                transaction.person_name,
                transaction.remarks,
                transaction.location,
                ...offerings.map(getOfferingLabel),
            ]
                .join(" ")
                .toLowerCase();

            return matchesFilter && searchable.includes(search.toLowerCase());
        });
    }, [transactions, filter, search]);

    return (
        <div className="event-transaction-table-card">
            <div className="event-transaction-table-toolbar">
                <div className="event-transaction-filters">
                    {FILTERS.map(({ value, label, icon: Icon }) => (
                        <button
                            type="button"
                            key={value}
                            className={filter === value ? "active" : ""}
                            onClick={() => setFilter(value)}
                        >
                            {Icon && <Icon size={15} />}
                            {label}
                        </button>
                    ))}
                </div>

                <div className="event-transaction-search">
                    <Search size={16} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search person or offering..."
                    />
                </div>
            </div>

            {filteredTransactions.length ? (
                <div className="event-transaction-table-scroll">
                    <table className="event-transaction-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Person</th>
                                <th>Location</th>
                                <th>Offerings</th>
                                <th>Remarks</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredTransactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td>
                                        {transaction.transaction_date
                                            ? new Date(
                                                `${transaction.transaction_date}T00:00:00`
                                            ).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })
                                            : "—"}
                                    </td>

                                    <td className="event-transaction-person">
                                        {transaction.person_name || "—"}
                                    </td>

                                    <td>
                                        <span className="event-transaction-location">
                                            {transaction.location || "—"}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="event-transaction-offering-list">
                                            {(transaction.my_event_offerings || []).map(
                                                (item, index) => (
                                                    <span
                                                        key={item.id || `${item.offering_type}-${index}`}
                                                        className={`event-offering-tag ${item.offering_type.toLowerCase()}`}
                                                    >
                                                        {getOfferingLabel(item)}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </td>


                                    <td>{transaction.remarks || "—"}</td>

                                    <td>
                                        <div className="event-transaction-actions">
                                            <button
                                                type="button"
                                                title="Edit transaction"
                                                onClick={() => onEdit(transaction)}
                                            >
                                                <Edit2 size={16} />
                                            </button>

                                            <button
                                                type="button"
                                                title="Delete transaction"
                                                className="delete"
                                                onClick={() => onDelete(transaction)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="event-transaction-table-empty">
                    <Gift size={30} />
                    <h3>No matching transactions</h3>
                    <p>Try another offering filter or search term.</p>
                </div>
            )}
        </div>
    );
};

export default EventTransactionTable;
