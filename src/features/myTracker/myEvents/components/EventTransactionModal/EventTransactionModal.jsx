
import React, { useEffect, useState } from "react";
import {
    X,
    Plus,
    Trash2,
    Wallet,
    Gem,
    Shirt,
    Gift,
} from "lucide-react";

import "./EventTransactionModal.css";

const getToday = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset();

    return new Date(date.getTime() - offset * 60000)
        .toISOString()
        .slice(0, 10);
};

const OFFERING_OPTIONS = [
    { type: "CASH", label: "Cash", icon: Wallet },
    { type: "GOLD", label: "Gold", icon: Gem },
    { type: "DRESS", label: "Dress", icon: Shirt },
    {
        type: "THATTUVARISAI",
        label: "Thattuvarisai",
        icon: Gift,
    },
];

const createEmptyOffering = (type) => ({
    offering_type: type,
    amount: "",
    gold_grams: "",
    item_count: "",
    description: "",
});

const EventTransactionModal = ({
    isOpen,
    transaction,
    saving = false,
    onClose,
    onSubmit,
}) => {
    const [personName, setPersonName] = useState("");
    const [transactionDate, setTransactionDate] = useState(getToday());
    const [remarks, setRemarks] = useState("");
    const [location, setLocation] = useState("");
    const [offerings, setOfferings] = useState([]);

    // Populate form when opening or editing a transaction
    useEffect(() => {
        if (!isOpen) return;

        setPersonName(transaction?.person_name || "");
        setTransactionDate(
            transaction?.transaction_date || getToday()
        );
        setRemarks(transaction?.remarks || "");
        setLocation(transaction?.location || "");

        const existing = transaction?.my_event_offerings || [];

        setOfferings(
            existing.length
                ? existing.map((item) => ({
                    ...createEmptyOffering(item.offering_type),
                    ...item,
                    amount:
                        item.amount_minor != null
                            ? (
                                Number(item.amount_minor) / 100
                            ).toString()
                            : "",
                    gold_grams: item.gold_grams ?? "",
                    item_count: item.item_count ?? "",
                    description: item.description || "",
                }))
                : []
        );
    }, [isOpen, transaction]);

    if (!isOpen) return null;

    // Select or remove offering type
    const toggleOffering = (type) => {
        setOfferings((current) => {
            const exists = current.some(
                (item) => item.offering_type === type
            );

            if (exists) {
                return current.filter(
                    (item) => item.offering_type !== type
                );
            }

            return [
                ...current,
                createEmptyOffering(type),
            ];
        });
    };

    // Update offering field
    const updateOffering = (type, field, value) => {
        setOfferings((current) =>
            current.map((item) =>
                item.offering_type === type
                    ? { ...item, [field]: value }
                    : item
            )
        );
    };

    // Prepare transaction payload
    const buildPayload = () => {
        const preparedOfferings = offerings.map((item) => {
            const offering = {
                offering_type: item.offering_type,
                amount_minor: null,
                gold_grams: null,
                item_count: null,
                description:
                    item.description?.trim() || null,
            };

            if (item.offering_type === "CASH") {
                offering.amount_minor = Math.round(
                    Number(item.amount || 0) * 100
                );
            }

            if (item.offering_type === "GOLD") {
                offering.gold_grams = Number(
                    item.gold_grams || 0
                );
            }

            if (
                item.offering_type === "DRESS" ||
                item.offering_type === "THATTUVARISAI"
            ) {
                offering.item_count = Number(
                    item.item_count || 0
                );
            }

            return offering;
        });

        return {
            person_name: personName.trim(),
            transaction_date: transactionDate,
            location: location.trim(),
            remarks: remarks.trim(),
            offerings: preparedOfferings,
        };
    };

    // Validate form
    const validate = () => {
        if (!personName.trim()) {
            window.alert("Please enter the person's name.");
            return false;
        }

        if (!transactionDate) {
            window.alert("Please select the transaction date.");
            return false;
        }

        if (!offerings.length) {
            window.alert(
                "Please select at least one offering type."
            );
            return false;
        }

        for (const item of offerings) {
            if (
                item.offering_type === "CASH" &&
                Number(item.amount) <= 0
            ) {
                window.alert(
                    "Please enter a valid cash amount."
                );
                return false;
            }

            if (
                item.offering_type === "GOLD" &&
                Number(item.gold_grams) <= 0
            ) {
                window.alert(
                    "Please enter a valid gold weight."
                );
                return false;
            }

            if (
                ["DRESS", "THATTUVARISAI"].includes(
                    item.offering_type
                ) &&
                Number(item.item_count) <= 0
            ) {
                window.alert(
                    `Please enter a valid ${item.offering_type === "DRESS"
                        ? "dress"
                        : "Thattuvarisai"
                    } quantity.`
                );
                return false;
            }
        }

        return true;
    };

    // Submit transaction
    const handleSubmit = (e) => {
        e.preventDefault();

        if (saving) return;

        if (!validate()) return;

        onSubmit(buildPayload());
    };

    return (
        <div
            className="event-transaction-modal-overlay"
            onMouseDown={(e) => {
                if (
                    e.target === e.currentTarget &&
                    !saving
                ) {
                    onClose();
                }
            }}
        >
            <div className="event-transaction-modal">

                {/* FIXED HEADER */}
                <div className="event-transaction-modal-header">
                    <div>
                        <h2>
                            {transaction
                                ? "Edit Transaction"
                                : "Add Transaction"}
                        </h2>

                        <p>
                            Record the gifts and contributions received.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="event-transaction-close"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="event-transaction-form"
                >

                    {/* SCROLLABLE BODY */}
                    <div className="event-transaction-form-body">

                        {/* BASIC INFORMATION */}
                        <div className="event-transaction-form-grid">

                            <label>
                                Person Name *

                                <input
                                    type="text"
                                    value={personName}
                                    onChange={(e) =>
                                        setPersonName(e.target.value)
                                    }
                                    placeholder="Enter person name"
                                    required
                                />
                            </label>

                            <label>
                                Transaction Date *

                                <input
                                    type="date"
                                    value={transactionDate}
                                    onChange={(e) =>
                                        setTransactionDate(e.target.value)
                                    }
                                    required
                                />
                            </label>

                        </div>

                        {/* LOCATION */}
                        <div className="event-transaction-location-field">
                            <label htmlFor="event-transaction-location">
                                Location
                            </label>

                            <input
                                id="event-transaction-location"
                                type="text"
                                value={location}
                                onChange={(e) =>
                                    setLocation(e.target.value)
                                }
                                placeholder="Enter event location"
                                maxLength={200}
                            />
                        </div>

                        {/* OFFERING SELECTION */}
                        <div className="event-offering-selection">

                            <h3>
                                Select Offering Types *
                            </h3>

                            <p>
                                You can select more than one offering.
                            </p>

                            <div className="event-offering-options">
                                {OFFERING_OPTIONS.map(
                                    ({ type, label, icon: Icon }) => {
                                        const selected = offerings.some(
                                            (item) =>
                                                item.offering_type === type
                                        );

                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                className={`event-offering-option ${selected ? "selected" : ""
                                                    }`}
                                                onClick={() =>
                                                    toggleOffering(type)
                                                }
                                                aria-pressed={selected}
                                            >
                                                <Icon size={19} />

                                                <span>{label}</span>

                                                <span className="event-offering-check">
                                                    {selected ? "✓" : "+"}
                                                </span>
                                            </button>
                                        );
                                    }
                                )}
                            </div>
                        </div>

                        {/* SELECTED OFFERING DETAILS */}
                        {offerings.map((item) => {
                            const label = OFFERING_OPTIONS.find(
                                (option) =>
                                    option.type === item.offering_type
                            )?.label;

                            return (
                                <div
                                    className="event-offering-entry"
                                    key={item.offering_type}
                                >

                                    <div className="event-offering-entry-heading">
                                        <h3>
                                            {label} Details
                                        </h3>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleOffering(
                                                    item.offering_type
                                                )
                                            }
                                            aria-label={`Remove ${label}`}
                                        >
                                            <Trash2 size={16} />
                                            Remove
                                        </button>
                                    </div>

                                    {/* CASH */}
                                    {item.offering_type === "CASH" && (
                                        <label>
                                            Cash Amount (₹) *

                                            <input
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={item.amount}
                                                onChange={(e) =>
                                                    updateOffering(
                                                        "CASH",
                                                        "amount",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Enter amount"
                                            />
                                        </label>
                                    )}

                                    {/* GOLD */}
                                    {item.offering_type === "GOLD" && (
                                        <label>
                                            Gold Weight (grams) *

                                            <input
                                                type="number"
                                                min="0.001"
                                                step="0.001"
                                                value={item.gold_grams}
                                                onChange={(e) =>
                                                    updateOffering(
                                                        "GOLD",
                                                        "gold_grams",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Example: 8"
                                            />

                                            <small>
                                                1 Savaran = 8 grams
                                            </small>
                                        </label>
                                    )}

                                    {/* DRESS / THATTUVARISAI */}
                                    {[
                                        "DRESS",
                                        "THATTUVARISAI",
                                    ].includes(item.offering_type) && (
                                            <div className="event-transaction-form-grid">

                                                <label>
                                                    {item.offering_type === "DRESS"
                                                        ? "Number of Dresses *"
                                                        : "Number of Items *"}

                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={item.item_count}
                                                        onChange={(e) =>
                                                            updateOffering(
                                                                item.offering_type,
                                                                "item_count",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter quantity"
                                                    />
                                                </label>

                                                <label>
                                                    {item.offering_type === "DRESS"
                                                        ? "Dress Details"
                                                        : "Item Details"}

                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) =>
                                                            updateOffering(
                                                                item.offering_type,
                                                                "description",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder={
                                                            item.offering_type === "DRESS"
                                                                ? "Example: Saree, Shirt"
                                                                : "Example: Silver plate, utensils"
                                                        }
                                                    />
                                                </label>

                                            </div>
                                        )}

                                </div>
                            );
                        })}

                        {/* REMARKS */}
                        <label className="event-transaction-remarks">
                            Remarks

                            <textarea
                                rows="3"
                                value={remarks}
                                onChange={(e) =>
                                    setRemarks(e.target.value)
                                }
                                placeholder="Additional notes..."
                            />
                        </label>

                    </div>

                    {/* FIXED FOOTER - OUTSIDE SCROLLABLE BODY */}
                    <div className="event-transaction-modal-footer">

                        <button
                            type="button"
                            className="event-transaction-cancel"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="event-transaction-save"
                            disabled={saving}
                        >
                            <Plus size={17} />

                            {saving
                                ? "Saving..."
                                : transaction
                                    ? "Update Transaction"
                                    : "Save Transaction"}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
};

export default EventTransactionModal;
