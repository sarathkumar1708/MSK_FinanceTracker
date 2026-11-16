
import React, { useMemo, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import {
    ArrowLeft,
    Plus,
    TrendingUp,
    Wallet,
    Receipt,
} from "lucide-react";

import {
    createTransaction,
    updateTransaction,
    deleteTransaction,
    selectSeervarisaiSaving,
} from "../../seervarisaiSlice";

import "./RelationMemberDetail.css";

import SeervarisaiTransactionModal from "../../components/SeervarisaiTransactionModal/SeervarisaiTransactionModal";
import RelationTransactionTable from "../../components/RelationTransactionTable/RelationTransactionTable";

const formatCurrency = (minor = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(minor || 0) / 100);

// const formatGold = (grams = 0) => {
//     const totalGrams = Number(grams || 0);
//     const savaran = Math.floor(totalGrams / 8);
//     const remainingGrams = Number((totalGrams % 8).toFixed(3));

//     if (savaran === 0) return `${remainingGrams} g`;
//     if (remainingGrams === 0) return `${savaran} Savaran`;

//     return `${savaran} Savaran ${remainingGrams} g`;
// };

const getOfferingSummary = (items) => {
    const summary = {
        cash: 0,
        silver: 0,
        gold: 0,
        dress: 0,
    };

    items.forEach((item) => {
        const offeringType = item.offering_type || "CASH";

        if (offeringType === "CASH") {
            summary.cash += Number(item.amount_minor || 0);
        }

        if (offeringType === "SILVER") {
            summary.silver += Number(item.amount_minor || 0);
        }

        if (offeringType === "GOLD") {
            summary.gold += Number(item.gold_grams || 0);
        }

        if (offeringType === "DRESS") {
            summary.dress += Number(item.item_count || 0);
        }
    });

    return summary;
};

function OfferingBreakdown({ summary }) {
    return (
        <div className="sv-offering-summary">
            <div className="sv-offering-summary-item cash">
                <span>Cash</span>
                <strong>{formatCurrency(summary.cash)}</strong>
            </div>

            <div className="sv-offering-summary-item gold">
                <span>Gold</span>
                <strong>{`${summary.gold} gram`}</strong>
            </div>

            <div className="sv-offering-summary-item dress">
                <span>Dress</span>
                <strong>{summary.dress} item(s)</strong>
            </div>

            <div className="sv-offering-summary-item silver">
                <span>Silver</span>
                <strong>{formatCurrency(summary.silver)}</strong>
            </div>
        </div>
    );
}

function RelationMemberDetail({
    member,
    transactions = [],
    onBack,
}) {
    const dispatch = useDispatch();
    const saving = useSelector(selectSeervarisaiSaving);

    const [showModal, setShowModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    // Controls which transaction table is currently displayed.
    const [activeTab, setActiveTab] = useState("RELATIONS_SPENT");

    const memberTransactions = useMemo(
        () =>
            transactions.filter(
                (item) => item.member_id === member.id
            ),
        [transactions, member.id]
    );

    const receivedTransactions = useMemo(
        () =>
            memberTransactions.filter(
                (item) => item.transaction_type === "RELATIONS_SPENT"
            ),
        [memberTransactions]
    );

    const paidTransactions = useMemo(
        () =>
            memberTransactions.filter(
                (item) => item.transaction_type === "I_SPENT"
            ),
        [memberTransactions]
    );

    const receivedSummary = useMemo(
        () => getOfferingSummary(receivedTransactions),
        [receivedTransactions]
    );

    const paidSummary = useMemo(
        () => getOfferingSummary(paidTransactions),
        [paidTransactions]
    );

    // Main monetary total = Cash + Silver only.
    const receivedTotal = receivedSummary.cash + receivedSummary.silver;
    const paidTotal = paidSummary.cash + paidSummary.silver;

    const openCreateModal = () => {
        setEditingTransaction(null);
        setShowModal(true);
    };

    const openEditModal = (transaction) => {
        setEditingTransaction(transaction);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingTransaction(null);
    };

    const handleSave = async (transactionData) => {
        try {
            if (editingTransaction) {
                await dispatch(
                    updateTransaction({
                        transactionId: editingTransaction.id,
                        transactionData,
                    })
                ).unwrap();
            } else {
                await dispatch(
                    createTransaction(transactionData)
                ).unwrap();
            }

            closeModal();
        } catch (error) {
            alert(error?.message || error || "Unable to save transaction.");
        }
    };

    const handleDelete = async (transaction) => {
        const confirmed = window.confirm(
            `Delete "${transaction.title}" transaction?`
        );

        if (!confirmed) return;

        try {
            await dispatch(
                deleteTransaction(transaction.id)
            ).unwrap();
        } catch (error) {
            alert(error?.message || error || "Unable to delete transaction.");
        }
    };

    return (
        <div className="sv-member-detail-page">
            <div className="sv-member-detail-heading">
                <button
                    type="button"
                    className="sv-member-back-btn"
                    onClick={onBack}
                >
                    <ArrowLeft size={17} />
                    Back to Members
                </button>

                <div className="sv-member-title-row">
                    <div>
                        <span className="sv-member-eyebrow">
                            SEERVARISAI MEMBER
                        </span>

                        <h1>{member.member_name}</h1>

                        <p>
                            {member.relationship || "Family Member"}
                            {member.remarks ? ` · ${member.remarks}` : ""}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="sv-add-transaction-btn"
                        onClick={openCreateModal}
                    >
                        <Plus size={18} />
                        Add Your Transaction
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="sv-member-summary-grid">
                <div className="sv-member-summary-card received">
                    <div className="sv-summary-icon">
                        <TrendingUp size={21} />
                    </div>

                    <span>Relations Spent to Me</span>
                    <strong>{formatCurrency(receivedTotal)}</strong>

                    <small>
                        {receivedTransactions.length} transaction(s)
                    </small>

                    <OfferingBreakdown summary={receivedSummary} />
                </div>

                <div className="sv-member-summary-card paid">
                    <div className="sv-summary-icon">
                        <Wallet size={21} />
                    </div>

                    <span>I Spent to Them</span>
                    <strong>{formatCurrency(paidTotal)}</strong>

                    <small>
                        {paidTransactions.length} transaction(s)
                    </small>

                    <OfferingBreakdown summary={paidSummary} />
                </div>

                {/* <div className="sv-member-summary-card count">
                    <div className="sv-summary-icon">
                        <Receipt size={21} />
                    </div>

                    <span>Total Transactions</span>
                    <strong>{memberTransactions.length}</strong>

                    <small>Recorded for this member</small>
                </div> */}
            </div>

            {/* Transaction History */}
            <div className="sv-member-transaction-section">
                <div className="sv-member-transaction-heading">
                    <div>
                        <h2>Transaction History</h2>
                        <p>
                            Transactions recorded for {member.member_name}
                        </p>
                    </div>
                </div>

                {/* Transaction Tabs */}
                <div className="sv-transaction-tabs">
                    <button
                        type="button"
                        className={`sv-transaction-tab ${activeTab === "RELATIONS_SPENT" ? "active" : ""
                            }`}
                        onClick={() => setActiveTab("RELATIONS_SPENT")}
                    >
                        <TrendingUp size={17} />
                        <span className="sv-transaction-tab-label">
                            Relations Spent to Me
                        </span>
                        <span className="sv-transaction-tab-count">
                            {receivedTransactions.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`sv-transaction-tab ${activeTab === "I_SPENT" ? "active" : ""
                            }`}
                        onClick={() => setActiveTab("I_SPENT")}
                    >
                        <Wallet size={17} />
                        <span className="sv-transaction-tab-label">
                            I Spent to Them
                        </span>
                        <span className="sv-transaction-tab-count">
                            {paidTransactions.length}
                        </span>
                    </button>
                </div>

                {/* Display only the selected table */}
                <div className="sv-transaction-tab-content">
                    {activeTab === "RELATIONS_SPENT" ? (
                        <RelationTransactionTable
                            title="Relations Spent to Me"
                            type="RELATIONS_SPENT"
                            transactions={receivedTransactions}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                        />
                    ) : (
                        <RelationTransactionTable
                            title="I Spent to Them"
                            type="I_SPENT"
                            transactions={paidTransactions}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                        />
                    )}
                </div>
            </div>

            <SeervarisaiTransactionModal
                isOpen={showModal}
                transaction={editingTransaction}
                memberId={member.id}
                saving={saving}
                onClose={closeModal}
                onSubmit={handleSave}
            />
        </div>
    );
}

export default RelationMemberDetail;
