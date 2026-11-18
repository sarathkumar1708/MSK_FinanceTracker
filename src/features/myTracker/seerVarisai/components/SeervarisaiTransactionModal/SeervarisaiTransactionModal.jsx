import React, { useEffect, useState } from "react";
import { X, Save, Check, Plus, Trash2 } from "lucide-react";

import "./SeervarisaiTransactionModal.css";

const OFFERING_OPTIONS = [
    { value: "CASH", label: "Cash", description: "Money received or spent", icon: "₹", color: "cash" },
    { value: "GOLD", label: "Gold", description: "Gold in grams", icon: "Au", color: "gold" },
    { value: "SILVER", label: "Silver", description: "Silver value in rupees", icon: "Ag", color: "silver" },
    { value: "DRESS", label: "Dress", description: "Clothing items", icon: "D", color: "dress" },
    { value: "THATTUVARISAI", label: "Thattuvarisai", description: "Thattuvarisai items", icon: "T", color: "thattuvarisai" },
];

const today = () => new Date().toISOString().slice(0, 10);

const createEmptyOffering = (type) => ({
    offering_type: type,
    amount: "",
    gold_grams: "",
    item_count: "",
});

const getInitialOfferings = (transaction) => {
    if (Array.isArray(transaction?.offerings) && transaction.offerings.length) {
        return transaction.offerings.map((item) => ({
            offering_type: item.offering_type || "CASH",
            amount:
                item.amount_minor !== null && item.amount_minor !== undefined
                    ? (Number(item.amount_minor) / 100).toString()
                    : "",
            gold_grams: item.gold_grams ?? "",
            item_count: item.item_count ?? "",
        }));
    }

    if (transaction) {
        return [{
            offering_type: transaction.offering_type || "CASH",
            amount:
                transaction.amount_minor !== null &&
                    transaction.amount_minor !== undefined
                    ? (Number(transaction.amount_minor) / 100).toString()
                    : "",
            gold_grams: transaction.gold_grams ?? "",
            item_count: transaction.item_count ?? "",
        }];
    }

    return [createEmptyOffering("CASH")];
};

const formatOfferingValue = (offering) => {
    switch (offering.offering_type) {
        case "CASH":
        case "SILVER":
            return offering.amount ? `₹${offering.amount}` : "Amount not entered";

        case "GOLD":
            return offering.gold_grams
                ? `${offering.gold_grams} grams`
                : "Weight not entered";

        case "DRESS":
            return offering.item_count
                ? `${offering.item_count} item(s)`
                : "Quantity not entered";

        case "THATTUVARISAI":
            return offering.item_count
                ? `${offering.item_count} item(s)`
                : "Quantity not entered";

        default:
            return "";
    }
};

function SeervarisaiTransactionModal({
    isOpen,
    transaction,
    memberId,
    saving = false,
    onClose,
    onSubmit,
}) {
    const [form, setForm] = useState({
        transaction_type: "RELATIONS_SPENT",
        title: "",
        transaction_date: today(),
        remarks: "",
        offerings: [createEmptyOffering("CASH")],
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isOpen) return;

        setForm({
            transaction_type: transaction?.transaction_type || "RELATIONS_SPENT",
            title: transaction?.title || "",
            transaction_date: transaction?.transaction_date || today(),
            remarks: transaction?.remarks || "",
            offerings: getInitialOfferings(transaction),
        });

        setErrors({});
    }, [isOpen, transaction]);

    if (!isOpen) return null;

    const updateField = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [field]: "",
        }));
    };

    const addOffering = (type) => {
        setForm((previous) => {
            if (previous.offerings.some((item) => item.offering_type === type)) {
                return previous;
            }

            return {
                ...previous,
                offerings: [
                    ...previous.offerings,
                    createEmptyOffering(type),
                ],
            };
        });
    };

    const removeOffering = (type) => {
        setForm((previous) => ({
            ...previous,
            offerings: previous.offerings.filter(
                (item) => item.offering_type !== type
            ),
        }));
    };

    const updateOffering = (type, field, value) => {
        setForm((previous) => ({
            ...previous,
            offerings: previous.offerings.map((item) =>
                item.offering_type === type
                    ? { ...item, [field]: value }
                    : item
            ),
        }));
    };

    const validateForm = () => {
        const nextErrors = {};

        if (!form.title.trim()) {
            nextErrors.title = "Please enter a transaction title.";
        }

        if (!form.transaction_date) {
            nextErrors.transaction_date = "Please select a date.";
        }

        if (!form.offerings.length) {
            nextErrors.offerings = "Select at least one offering type.";
        }

        form.offerings.forEach((item) => {
            if (item.offering_type === "CASH" || item.offering_type === "SILVER") {
                if (item.amount === "" || !Number.isFinite(Number(item.amount)) || Number(item.amount) <= 0) {
                    nextErrors[item.offering_type] = "Enter a valid amount.";
                }
            }

            if (item.offering_type === "GOLD") {
                if (
                    item.gold_grams === "" ||
                    !Number.isFinite(Number(item.gold_grams)) ||
                    Number(item.gold_grams) <= 0
                ) {
                    nextErrors.GOLD = "Enter valid gold weight.";
                }
            }

            if (item.offering_type === "DRESS" || item.offering_type === "THATTUVARISAI") {
                if (
                    item.item_count === "" ||
                    !Number.isInteger(Number(item.item_count)) ||
                    Number(item.item_count) <= 0
                ) {
                    nextErrors[item.offering_type] = "Enter a valid quantity.";
                }
            }
        });

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!validateForm()) return;

        const payload = {
            member_id: memberId,
            transaction_type: form.transaction_type,
            title: form.title.trim(),
            transaction_date: form.transaction_date,
            remarks: form.remarks.trim(),
            offerings: form.offerings.map((offering) => ({
                offering_type: offering.offering_type,
                amount_minor:
                    offering.offering_type === "CASH" ||
                        offering.offering_type === "SILVER"
                        ? Math.round(Number(offering.amount) * 100)
                        : null,
                gold_grams:
                    offering.offering_type === "GOLD"
                        ? Number(offering.gold_grams)
                        : null,
                item_count:
                    offering.offering_type === "DRESS" ||
                        offering.offering_type === "THATTUVARISAI"
                        ? Number(offering.item_count)
                        : null,
            })),
        };

        onSubmit(payload);
    };

    return (
        <div className="sv-modal-overlay" onMouseDown={onClose}>
            <div
                className="sv-transaction-modal"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="sv-modal-header">
                    <div>
                        <span className="sv-modal-eyebrow">SEERVARISAI</span>
                        <h2>{transaction ? "Edit Transaction" : "Add Transaction"}</h2>
                        <p>Record the offerings exchanged with this relation.</p>
                    </div>

                    <button
                        type="button"
                        className="sv-modal-close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form className="sv-transaction-form" onSubmit={handleSubmit}>
                    <div className="sv-modal-body">
                        <section className="sv-form-section">
                            <div className="sv-section-heading">
                                <span className="sv-section-number">01</span>
                                <div>
                                    <h3>Transaction Details</h3>
                                    <p>Enter the basic transaction information.</p>
                                </div>
                            </div>

                            <div className="sv-modal-fields">
                                <div className="sv-form-field sv-field-full">
                                    <label>Transaction Direction *</label>

                                    <div className="sv-direction-options">
                                        <button
                                            type="button"
                                            className={`sv-direction-card received ${form.transaction_type === "RELATIONS_SPENT" ? "selected" : ""
                                                }`}
                                            onClick={() => updateField("transaction_type", "RELATIONS_SPENT")}
                                        >
                                            <span className="sv-direction-symbol">↓</span>
                                            <span>
                                                <strong>Relations Spent to Me</strong>
                                                <small>Received from relations</small>
                                            </span>
                                            {form.transaction_type === "RELATIONS_SPENT" && <Check size={17} />}
                                        </button>

                                        <button
                                            type="button"
                                            className={`sv-direction-card paid ${form.transaction_type === "I_SPENT" ? "selected" : ""
                                                }`}
                                            onClick={() => updateField("transaction_type", "I_SPENT")}
                                        >
                                            <span className="sv-direction-symbol">↑</span>
                                            <span>
                                                <strong>I Spent to Them</strong>
                                                <small>Given to relations</small>
                                            </span>
                                            {form.transaction_type === "I_SPENT" && <Check size={17} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="sv-form-field">
                                    <label htmlFor="sv-transaction-title">Transaction Title *</label>
                                    <input
                                        id="sv-transaction-title"
                                        type="text"
                                        value={form.title}
                                        onChange={(event) => updateField("title", event.target.value)}
                                        placeholder="e.g. Wedding, Seervarisai"
                                    />
                                    {errors.title && <small className="sv-field-error">{errors.title}</small>}
                                </div>

                                <div className="sv-form-field">
                                    <label htmlFor="sv-transaction-date">Transaction Date *</label>
                                    <input
                                        id="sv-transaction-date"
                                        type="date"
                                        value={form.transaction_date}
                                        onChange={(event) => updateField("transaction_date", event.target.value)}
                                    />
                                    {errors.transaction_date && (
                                        <small className="sv-field-error">{errors.transaction_date}</small>
                                    )}
                                </div>

                                <div className="sv-form-field sv-field-full">
                                    <label htmlFor="sv-transaction-remarks">Remarks</label>
                                    <textarea
                                        id="sv-transaction-remarks"
                                        rows="3"
                                        value={form.remarks}
                                        onChange={(event) => updateField("remarks", event.target.value)}
                                        placeholder="Add any additional notes..."
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="sv-form-section">
                            <div className="sv-section-heading">
                                <span className="sv-section-number">02</span>
                                <div>
                                    <h3>Offering Types</h3>
                                    <p>Select one or more types to record.</p>
                                </div>
                            </div>

                            <div className="sv-offering-options">
                                {OFFERING_OPTIONS.map((option) => {
                                    const selected = form.offerings.some(
                                        (item) => item.offering_type === option.value
                                    );

                                    return (
                                        <button
                                            type="button"
                                            key={option.value}
                                            className={`sv-offering-option ${option.color} ${selected ? "selected" : ""
                                                }`}
                                            onClick={() =>
                                                selected
                                                    ? removeOffering(option.value)
                                                    : addOffering(option.value)
                                            }
                                        >
                                            <span className="sv-offering-option-icon">
                                                {option.icon}
                                            </span>

                                            <span className="sv-offering-option-text">
                                                <strong>{option.label}</strong>
                                                <small>{option.description}</small>
                                            </span>

                                            <span className="sv-offering-check">
                                                {selected && <Check size={15} />}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {errors.offerings && (
                                <small className="sv-field-error">{errors.offerings}</small>
                            )}
                        </section>

                        {form.offerings.length > 0 && (
                            <section className="sv-form-section">
                                <div className="sv-section-heading">
                                    <span className="sv-section-number">03</span>
                                    <div>
                                        <h3>Offering Details</h3>
                                        <p>Enter the value or quantity for each selected type.</p>
                                    </div>
                                </div>

                                <div className="sv-offering-details">
                                    {form.offerings.map((offering) => {
                                        const option = OFFERING_OPTIONS.find(
                                            (item) => item.value === offering.offering_type
                                        );

                                        const type = offering.offering_type;

                                        return (
                                            <div
                                                className={`sv-offering-detail-card ${option?.color || ""}`}
                                                key={type}
                                            >
                                                <div className="sv-offering-detail-heading">
                                                    <div>
                                                        <span className="sv-detail-icon">{option?.icon}</span>
                                                        <div>
                                                            <h4>{option?.label}</h4>
                                                            <p>{option?.description}</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="sv-remove-offering"
                                                        onClick={() => removeOffering(type)}
                                                        aria-label={`Remove ${option?.label}`}
                                                        disabled={form.offerings.length === 1}
                                                        title={
                                                            form.offerings.length === 1
                                                                ? "At least one offering is required"
                                                                : "Remove offering"
                                                        }
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                {(type === "CASH" || type === "SILVER") && (
                                                    <div className="sv-form-field">
                                                        <label>
                                                            {type === "CASH" ? "Cash Amount (₹) *" : "Silver Value (₹) *"}
                                                        </label>
                                                        <div className="sv-input-with-prefix">
                                                            <span>₹</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={offering.amount}
                                                                onChange={(event) =>
                                                                    updateOffering(type, "amount", event.target.value)
                                                                }
                                                                placeholder="Enter amount"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {type === "GOLD" && (
                                                    <div className="sv-form-field">
                                                        <label>Gold Weight (Grams) *</label>
                                                        <div className="sv-input-with-suffix">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.001"
                                                                value={offering.gold_grams}
                                                                onChange={(event) =>
                                                                    updateOffering(type, "gold_grams", event.target.value)
                                                                }
                                                                placeholder="Enter gold weight"
                                                            />
                                                            <span>Grams</span>
                                                        </div>
                                                        <small className="sv-field-hint">
                                                            1 Savaran = 8 grams
                                                        </small>
                                                    </div>
                                                )}

                                                {(type === "DRESS" || type === "THATTUVARISAI") && (
                                                    <div className="sv-form-field">
                                                        <label>
                                                            {type === "DRESS"
                                                                ? "Dress Quantity *"
                                                                : "Thattuvarisai Quantity *"}
                                                        </label>
                                                        <div className="sv-input-with-suffix">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                step="1"
                                                                value={offering.item_count}
                                                                onChange={(event) =>
                                                                    updateOffering(type, "item_count", event.target.value)
                                                                }
                                                                placeholder="Enter quantity"
                                                            />
                                                            <span>Items</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {errors[type] && (
                                                    <small className="sv-field-error">{errors[type]}</small>
                                                )}

                                                <div className="sv-offering-preview">
                                                    <span>Entered value</span>
                                                    <strong>{formatOfferingValue(offering)}</strong>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="sv-modal-footer">
                        <button
                            type="button"
                            className="sv-modal-cancel"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="sv-modal-save"
                            disabled={saving}
                        >
                            <Save size={17} />
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
}

export default SeervarisaiTransactionModal;