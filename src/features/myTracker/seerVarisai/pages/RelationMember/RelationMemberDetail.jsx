import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    ArrowLeft,
    Plus,
    TrendingUp,
    Wallet,
    Search,
    Filter,
    X,
} from "lucide-react";

import {
    createTransaction,
    updateTransaction,
    deleteTransaction,
    selectSeervarisaiSaving,
} from "../../seervarisaiSlice";

import "./RelationMemberDetail.css";

import SeervarisaiTransactionModal from "../../components/SeervarisaiTransactionModal/SeervarisaiTransactionModal";
import RelationTransactionTable, {
    getTransactionOfferings,
} from "../../components/RelationTransactionTable/RelationTransactionTable";

// ============================================
// FORMAT HELPERS
// ============================================

const formatCurrency = (minor = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(minor || 0) / 100);

const formatGold = (grams = 0) => {
    const totalGrams = Number(grams || 0);
    const savaran = Math.floor(totalGrams / 8);
    const remainingGrams = Number((totalGrams % 8).toFixed(3));

    if (savaran === 0) return `${remainingGrams} Grams`;
    if (remainingGrams === 0) return `${savaran} Savaran`;

    return `${savaran} Savaran ${remainingGrams} Grams`;
};

// ============================================
// OFFERING SUMMARY
// ============================================

const getOfferingSummary = (transactions) => {
    const summary = {
        cash: 0,
        silver: 0,
        gold: 0,
        dress: 0,
        thattuvarisai: 0,
    };

    transactions.forEach((transaction) => {
        getTransactionOfferings(transaction).forEach((item) => {
            switch (item.offering_type || "CASH") {
                case "CASH":
                    summary.cash += Number(item.amount_minor || 0);
                    break;

                case "SILVER":
                    summary.silver += Number(item.amount_minor || 0);
                    break;

                case "GOLD":
                    summary.gold += Number(item.gold_grams || 0);
                    break;

                case "DRESS":
                    summary.dress += Number(item.item_count || 0);
                    break;

                case "THATTUVARISAI":
                    summary.thattuvarisai += Number(item.item_count || 0);
                    break;

                default:
                    break;
            }
        });
    });

    return summary;
};

// ============================================
// OFFERING BREAKDOWN
// ============================================

function OfferingBreakdown({ summary }) {
    return (
        <div className="sv-offering-summary">
            <div className="sv-offering-summary-item cash">
                <span>Cash</span>
                <strong>{formatCurrency(summary.cash)}</strong>
            </div>

            <div className="sv-offering-summary-item gold">
                <span>Gold</span>
                <strong>{formatGold(summary.gold)}</strong>
            </div>

            <div className="sv-offering-summary-item dress">
                <span>Dress</span>
                <strong>{summary.dress} item(s)</strong>
            </div>

            <div className="sv-offering-summary-item silver">
                <span>Silver</span>
                <strong>{formatCurrency(summary.silver)}</strong>
            </div>

            <div className="sv-offering-summary-item thattuvarisai">
                <span>Thattuvarisai</span>
                <strong>{summary.thattuvarisai} item(s)</strong>
            </div>
        </div>
    );
}

// ============================================
// SEARCH HELPERS
// ============================================

const OFFERING_LABELS = {
    CASH: "cash",
    GOLD: "gold",
    SILVER: "silver",
    DRESS: "dress",
    THATTUVARISAI: "thattuvarisai",
};

const getTransactionSearchText = (transaction) => {
    const offerings = getTransactionOfferings(transaction);

    const offeringText = offerings.map((item) => {
        const type = item.offering_type || "CASH";

        return [
            OFFERING_LABELS[type] || type,
            item.amount_minor,
            item.amount_minor !== null && item.amount_minor !== undefined
                ? Number(item.amount_minor) / 100
                : "",
            item.gold_grams,
            item.item_count,
        ].join(" ");
    }).join(" ");

    return [
        transaction.title,
        transaction.remarks,
        transaction.transaction_date,
        ...offerings.map((item) => item.offering_type),
        offeringText,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
};

const matchesOfferingFilter = (transaction, filter) => {
    if (filter === "ALL") return true;

    return getTransactionOfferings(transaction).some(
        (item) => item.offering_type === filter
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

function RelationMemberDetail({
    member,
    transactions = [],
    onBack,
}) {
    const dispatch = useDispatch();
    const saving = useSelector(selectSeervarisaiSaving);

    const [showModal, setShowModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    const [activeTab, setActiveTab] = useState("RELATIONS_SPENT");
    const [searchTerm, setSearchTerm] = useState("");
    const [offeringFilter, setOfferingFilter] = useState("ALL");

    // ========================================
    // MEMBER TRANSACTIONS
    // ========================================

    const memberTransactions = useMemo(
        () => transactions.filter((item) => item.member_id === member.id),
        [transactions, member.id]
    );

    const receivedTransactions = useMemo(
        () => memberTransactions.filter(
            (item) => item.transaction_type === "RELATIONS_SPENT"
        ),
        [memberTransactions]
    );

    const paidTransactions = useMemo(
        () => memberTransactions.filter(
            (item) => item.transaction_type === "I_SPENT"
        ),
        [memberTransactions]
    );

    // ========================================
    // OFFERING SUMMARIES
    // ========================================

    const receivedSummary = useMemo(
        () => getOfferingSummary(receivedTransactions),
        [receivedTransactions]
    );

    const paidSummary = useMemo(
        () => getOfferingSummary(paidTransactions),
        [paidTransactions]
    );

    // Cash + Silver are monetary totals.
    const receivedTotal = receivedSummary.cash + receivedSummary.silver;
    const paidTotal = paidSummary.cash + paidSummary.silver;

    // ========================================
    // ACTIVE HISTORY + FILTERS
    // ========================================

    const activeTransactions =
        activeTab === "RELATIONS_SPENT"
            ? receivedTransactions
            : paidTransactions;

    const filteredTransactions = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return activeTransactions.filter((transaction) => {
            const matchesSearch =
                !search ||
                getTransactionSearchText(transaction).includes(search);

            const matchesType = matchesOfferingFilter(
                transaction,
                offeringFilter
            );

            return matchesSearch && matchesType;
        });
    }, [activeTransactions, searchTerm, offeringFilter]);

    const clearFilters = () => {
        setSearchTerm("");
        setOfferingFilter("ALL");
    };

    const hasActiveFilters =
        searchTerm.trim() !== "" || offeringFilter !== "ALL";

    // ========================================
    // MODAL HANDLERS
    // ========================================

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

    // ========================================
    // SAVE TRANSACTION
    // ========================================

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
                await dispatch(createTransaction(transactionData)).unwrap();
            }

            closeModal();
        } catch (error) {
            alert(
                error?.message ||
                error ||
                "Unable to save transaction."
            );
        }
    };

    // ========================================
    // DELETE TRANSACTION
    // ========================================

    const handleDelete = async (transaction) => {
        const confirmed = window.confirm(
            `Delete "${transaction.title}" transaction?`
        );

        if (!confirmed) return;

        try {
            await dispatch(deleteTransaction(transaction.id)).unwrap();
        } catch (error) {
            alert(
                error?.message ||
                error ||
                "Unable to delete transaction."
            );
        }
    };

    // ========================================
    // RENDER
    // ========================================

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
                    <div className="sv-member-title-info">
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

            {/* SUMMARY CARDS */}

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
            </div>

            {/* TRANSACTION HISTORY */}

            <div className="sv-member-transaction-section">
                <div className="sv-member-transaction-heading">
                    <div>
                        <h2>Transaction History</h2>
                        <p>
                            Transactions recorded for {member.member_name}
                        </p>
                    </div>
                </div>

                {/* TABS */}

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

                {/* SEARCH AND OFFERING FILTER */}

                <div className="sv-history-filter-panel">
                    <div className="sv-history-search">
                        <Search size={17} />

                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search title, remarks, date, offering or value..."
                            aria-label="Search transaction history"
                        />

                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm("")}
                                aria-label="Clear search"
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>

                    <div className="sv-history-type-filter">
                        <Filter size={16} />

                        <select
                            value={offeringFilter}
                            onChange={(event) => setOfferingFilter(event.target.value)}
                            aria-label="Filter by offering type"
                        >
                            <option value="ALL">All Offerings</option>
                            <option value="CASH">Cash</option>
                            <option value="GOLD">Gold</option>
                            <option value="SILVER">Silver</option>
                            <option value="DRESS">Dress</option>
                            <option value="THATTUVARISAI">Thattuvarisai</option>
                        </select>
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            className="sv-history-clear-filter"
                            onClick={clearFilters}
                        >
                            <X size={14} />
                            Clear
                        </button>
                    )}
                </div>

                <div className="sv-history-result-info">
                    Showing <strong>{filteredTransactions.length}</strong> of{" "}
                    <strong>{activeTransactions.length}</strong> transactions
                    {offeringFilter !== "ALL" && (
                        <span>
                            {" "}· Filtered by{" "}
                            <strong>
                                {offeringFilter === "THATTUVARISAI"
                                    ? "Thattuvarisai"
                                    : offeringFilter.charAt(0) +
                                    offeringFilter.slice(1).toLowerCase()}
                            </strong>
                        </span>
                    )}
                </div>

                {/* ACTIVE TABLE */}

                <div className="sv-transaction-tab-content">
                    <RelationTransactionTable
                        title={
                            activeTab === "RELATIONS_SPENT"
                                ? "Relations Spent to Me"
                                : "I Spent to Them"
                        }
                        type={activeTab}
                        transactions={filteredTransactions}
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                    />
                </div>
            </div>

            {/* TRANSACTION MODAL */}

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