import React, { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import "./SeervarisaiTransactionModal.css";

const getToday = () => new Date().toISOString().slice(0, 10);

const INITIAL_FORM = {
    transaction_type: "RELATIONS_SPENT",
    offering_type: "CASH",
    title: "",
    amount: "",
    gold_grams: "",
    item_count: "",
    transaction_date: getToday(),
    remarks: "",
};

function SeervarisaiTransactionModal({
    isOpen,
    transaction,
    memberId,
    saving,
    onClose,
    onSubmit,
}) {
    const [form, setForm] = useState(INITIAL_FORM);

    useEffect(() => {
        if (!isOpen) return;

        if (transaction) {
            setForm({
                transaction_type:
                    transaction.transaction_type || "RELATIONS_SPENT",
                offering_type: transaction.offering_type || "CASH",
                title: transaction.title || "",
                amount:
                    transaction.amount_minor != null
                        ? String(transaction.amount_minor / 100)
                        : "",
                gold_grams:
                    transaction.gold_grams != null
                        ? String(transaction.gold_grams)
                        : "",
                item_count:
                    transaction.item_count != null
                        ? String(transaction.item_count)
                        : "",
                transaction_date:
                    transaction.transaction_date || getToday(),
                remarks: transaction.remarks || "",
            });
        } else {
            setForm({
                ...INITIAL_FORM,
                transaction_date: getToday(),
            });
        }
    }, [isOpen, transaction]);

    if (!isOpen) return null;

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!form.title.trim()) {
            alert("Please enter a transaction title.");
            return;
        }

        let amountMinor = null;
        let goldGrams = null;
        let itemCount = null;

        if (form.offering_type === "CASH" || form.offering_type === "SILVER") {
            const amount =
                form.amount.trim() === "" ? null : Number(form.amount);

            if (
                amount !== null &&
                (!Number.isFinite(amount) || amount <= 0)
            ) {
                alert("Please enter a valid amount.");
                return;
            }

            if (amount !== null) {
                amountMinor = Math.round(amount * 100);
            }
        }

        if (form.offering_type === "GOLD") {
            const grams =
                form.gold_grams.trim() === ""
                    ? null
                    : Number(form.gold_grams);

            if (
                grams === null ||
                !Number.isFinite(grams) ||
                grams <= 0
            ) {
                alert("Please enter the gold weight in grams.");
                return;
            }

            goldGrams = grams;
        }

        if (form.offering_type === "DRESS") {
            const count =
                form.item_count.trim() === ""
                    ? null
                    : Number(form.item_count);

            if (
                count === null ||
                !Number.isInteger(count) ||
                count <= 0
            ) {
                alert("Please enter a valid dress count.");
                return;
            }

            itemCount = count;
        }

        onSubmit({
            member_id: memberId,
            transaction_type: form.transaction_type,
            offering_type: form.offering_type,
            title: form.title.trim(),
            amount_minor: amountMinor,
            gold_grams: goldGrams,
            item_count: itemCount,
            transaction_date: form.transaction_date,
            remarks: form.remarks.trim() || null,
        });
    };

    return (
        <div className="sv-modal-overlay">
            <div className="sv-transaction-modal">
                <div className="sv-modal-header">
                    <div>
                        <h2>
                            {transaction ? "Edit Transaction" : "Add Transaction"}
                        </h2>
                        <p>Record this member's Seervarisai transaction</p>
                    </div>

                    <button
                        type="button"
                        className="sv-modal-close"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="sv-form-group">
                        <label>Transaction Direction</label>

                        <div className="sv-direction-options">
                            <label
                                className={
                                    form.transaction_type === "RELATIONS_SPENT"
                                        ? "active received"
                                        : ""
                                }
                            >
                                <input
                                    type="radio"
                                    name="transaction_type"
                                    value="RELATIONS_SPENT"
                                    checked={
                                        form.transaction_type === "RELATIONS_SPENT"
                                    }
                                    onChange={handleChange}
                                />
                                Relations Spent to Me
                            </label>

                            <label
                                className={
                                    form.transaction_type === "I_SPENT"
                                        ? "active paid"
                                        : ""
                                }
                            >
                                <input
                                    type="radio"
                                    name="transaction_type"
                                    value="I_SPENT"
                                    checked={form.transaction_type === "I_SPENT"}
                                    onChange={handleChange}
                                />
                                I Spent to Them
                            </label>
                        </div>
                    </div>

                    <div className="sv-form-group">
                        <label>Offering Type</label>
                        <select
                            name="offering_type"
                            value={form.offering_type}
                            onChange={handleChange}
                            className="sv-offering-select"
                        >
                            <option value="CASH">Cash</option>
                            <option value="GOLD">Gold</option>
                            <option value="DRESS">Dress</option>
                            <option value="SILVER">Silver</option>
                        </select>
                    </div>

                    <div className="sv-form-group">
                        <label>Transaction Title</label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="e.g. Wedding Seervarisai"
                            required
                        />
                    </div>

                    {(form.offering_type === "CASH" ||
                        form.offering_type === "SILVER") && (
                            <div className="sv-form-group">
                                <label>
                                    {form.offering_type === "CASH"
                                        ? "Cash Amount (₹)"
                                        : "Silver Amount (₹)"}
                                    <span> (Optional)</span>
                                </label>

                                <input
                                    type="number"
                                    name="amount"
                                    value={form.amount}
                                    onChange={handleChange}
                                    min="0.01"
                                    step="0.01"
                                    placeholder="Enter amount"
                                />
                                <small>
                                    Leave empty if no monetary amount is recorded.
                                </small>
                            </div>
                        )}

                    {form.offering_type === "GOLD" && (
                        <div className="sv-form-group">
                            <label>Gold Weight (Grams)</label>
                            <input
                                type="number"
                                name="gold_grams"
                                value={form.gold_grams}
                                onChange={handleChange}
                                min="0.001"
                                step="0.001"
                                placeholder="e.g. 10"
                                required
                            />
                            <small>
                                8 grams = 1 Savaran. For example, 10 grams
                                displays as 1 Savaran 2 Grams.
                            </small>
                        </div>
                    )}

                    {form.offering_type === "DRESS" && (
                        <div className="sv-form-group">
                            <label>Dress Count</label>
                            <input
                                type="number"
                                name="item_count"
                                value={form.item_count}
                                onChange={handleChange}
                                min="1"
                                step="1"
                                placeholder="e.g. 2"
                                required
                            />
                        </div>
                    )}

                    <div className="sv-form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            name="transaction_date"
                            value={form.transaction_date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="sv-form-group">
                        <label>Remarks / Item Details</label>
                        <textarea
                            name="remarks"
                            value={form.remarks}
                            onChange={handleChange}
                            rows="3"
                            placeholder="e.g. One silk saree and fruits basket"
                        />
                    </div>

                    <div className="sv-modal-actions">
                        <button
                            type="button"
                            className="sv-cancel-btn"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="sv-save-btn"
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