
import { useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";

import {
    InvestmentPageHeader,
    InvestmentCard,
    InvestmentSection,
} from "../../components/InvestmentShared/InvestmentShared";

import InvestmentFormModal from "../../components/InvestmentFormModal/InvestmentFormModal";
import "./AllInvestments.css";

export default function AllInvestments({
    investments = [],
    transactions = [],
    monthlySnapshots = [],
    loading = false,
    saving = false,
    error = null,
    onAdd,
    onEdit,
    onDelete,
    onClose,
    onActivate,
}) {
    const [showModal, setShowModal] = useState(false);
    const [selectedInvestment, setSelectedInvestment] = useState(null);
    const [statusFilter, setStatusFilter] = useState("active");

    /* =====================================================
       INVESTMENT CARD DATA
    ===================================================== */

    const investmentCards = useMemo(() => {
        return investments.map((investment) => {
            const investmentTransactions = transactions.filter(
                (transaction) =>
                    transaction.investment_id === investment.id
            );

            const totalInvested = investmentTransactions
                .filter(
                    (item) => item.transaction_type === "CONTRIBUTION"
                )
                .reduce(
                    (sum, item) => sum + Number(item.amount || 0),
                    0
                );

            const totalWithdrawals = investmentTransactions
                .filter(
                    (item) => item.transaction_type === "WITHDRAWAL"
                )
                .reduce(
                    (sum, item) => sum + Number(item.amount || 0),
                    0
                );

            const investmentSnapshots = monthlySnapshots
                .filter(
                    (snapshot) =>
                        snapshot.investment_id === investment.id
                )
                .sort(
                    (a, b) =>
                        new Date(b.month).getTime() -
                        new Date(a.month).getTime()
                );

            const latestSnapshot = investmentSnapshots[0];

            const ledgerBalance = investmentTransactions.reduce(
                (balance, transaction) => {
                    const amount = Number(transaction.amount || 0);

                    return transaction.transaction_type === "CONTRIBUTION"
                        ? balance + amount
                        : balance - amount;
                },
                0
            );

            const currentValue =
                latestSnapshot?.current_market_value ??
                latestSnapshot?.closing_balance ??
                ledgerBalance;

            return {
                investment,
                totalInvested,
                totalWithdrawals,
                currentValue: Number(currentValue || 0),
            };
        });
    }, [investments, transactions, monthlySnapshots]);

    /* =====================================================
       FILTER INVESTMENTS
    ===================================================== */

    const filteredCards = investmentCards.filter(({ investment }) => {
        const status = String(
            investment.status || "active"
        ).toLowerCase();

        return statusFilter === "all" || status === statusFilter;
    });

    /* =====================================================
       ADD / EDIT
    ===================================================== */

    const handleAdd = () => {
        setSelectedInvestment(null);
        setShowModal(true);
    };

    const handleEdit = (investment) => {
        setSelectedInvestment(investment);
        setShowModal(true);
    };

    const handleSubmit = async (formData) => {
        if (selectedInvestment) {
            await onEdit(selectedInvestment.id, formData);
        } else {
            await onAdd(formData);
        }

        setShowModal(false);
        setSelectedInvestment(null);
    };

    /* =====================================================
       DELETE
    ===================================================== */

    const handleDelete = async (investment) => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete "${investment.name}"?\n\nAll associated transactions and monthly snapshots will also be deleted. This action cannot be undone.`
        );

        if (!confirmed) return;

        await onDelete?.(investment.id);
    };

    /* =====================================================
       CLOSE
    ===================================================== */

    const handleClose = async (investment) => {
        if (!onClose) return;

        const confirmed = window.confirm(
            `Close "${investment.name}"?\n\nIts transaction history and monthly snapshots will be retained.`
        );

        if (!confirmed) return;

        await onClose(investment.id);
    };

    /* =====================================================
       REACTIVATE
    ===================================================== */

    const handleActivate = async (investment) => {
        if (!onActivate) return;

        const confirmed = window.confirm(
            `Reactivate "${investment.name}"?\n\nThis investment will become active again.`
        );

        if (!confirmed) return;

        await onActivate(investment.id);
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="all-investments-page">

            {/* PAGE HEADER */}

            <InvestmentPageHeader
                title="All Investments"
                description="Manage and monitor all your investments."
                actionLabel="Create Investment"
                onAction={handleAdd}
            />

            {/* STATUS FILTERS */}

            <div className="investment-filter-bar">
                {[
                    { label: "Active", value: "active" },
                    { label: "Closed", value: "closed" },
                    { label: "All", value: "all" },
                ].map((filter) => (
                    <button
                        key={filter.value}
                        type="button"
                        className={
                            statusFilter === filter.value ? "active" : ""
                        }
                        onClick={() => setStatusFilter(filter.value)}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* ERROR */}

            {error && (
                <div className="investment-page-error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* INVESTMENT CONTENT */}

            {loading ? (
                <div className="investment-empty-state">
                    Loading investments...
                </div>
            ) : filteredCards.length === 0 ? (
                <div className="investment-empty-state">
                    <h3>No investments found</h3>

                    <p>
                        {statusFilter === "active"
                            ? "Create your first investment to get started."
                            : statusFilter === "closed"
                                ? "There are no closed investments."
                                : "There are no investments available."}
                    </p>

                    {statusFilter === "active" && (
                        <button
                            type="button"
                            onClick={handleAdd}
                        >
                            Create Investment
                        </button>
                    )}
                </div>
            ) : (
                <InvestmentSection
                    title={`${statusFilter === "all"
                            ? "All"
                            : statusFilter === "active"
                                ? "Active"
                                : "Closed"
                        } Investments`}
                    description={`${filteredCards.length} investment(s)`}
                >
                    <div className="all-investments-grid">
                        {filteredCards.map((item) => (
                            <InvestmentCard
                                key={item.investment.id}
                                investment={item.investment}
                                totalInvested={item.totalInvested}
                                totalWithdrawals={item.totalWithdrawals}
                                currentValue={item.currentValue}
                                onEdit={() =>
                                    handleEdit(item.investment)
                                }
                                onDelete={() =>
                                    handleDelete(item.investment)
                                }
                                onClose={() =>
                                    handleClose(item.investment)
                                }
                                onActivate={() =>
                                    handleActivate(item.investment)
                                }
                            />
                        ))}
                    </div>
                </InvestmentSection>
            )}

            {/* FORM MODAL */}

            <InvestmentFormModal
                isOpen={showModal}
                investment={selectedInvestment}
                saving={saving}
                onClose={() => {
                    setShowModal(false);
                    setSelectedInvestment(null);
                }}
                onSubmit={handleSubmit}
            />

        </div>
    );
}
