
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
}) {
    const [showModal, setShowModal] = useState(false);
    const [selectedInvestment, setSelectedInvestment] = useState(null);
    const [statusFilter, setStatusFilter] = useState("active");

    const investmentCards = useMemo(() => {
        return investments.map((investment) => {
            const investmentTransactions = transactions.filter(
                (transaction) =>
                    transaction.investment_id === investment.id
            );

            const totalInvested = investmentTransactions
                .filter((item) => item.transaction_type === "CONTRIBUTION")
                .reduce((sum, item) => sum + Number(item.amount || 0), 0);

            const totalWithdrawals = investmentTransactions
                .filter((item) => item.transaction_type === "WITHDRAWAL")
                .reduce((sum, item) => sum + Number(item.amount || 0), 0);

            const investmentSnapshots = monthlySnapshots
                .filter((snapshot) => snapshot.investment_id === investment.id)
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

    const filteredCards = investmentCards.filter(({ investment }) =>
        statusFilter === "all"
            ? true
            : investment.status === statusFilter
    );

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

    const handleDelete = async (investment) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${investment.name}"?`
        );

        if (!confirmed) return;

        await onDelete(investment.id);
    };

    const handleClose = async (investment) => {
        const confirmed = window.confirm(
            `Close "${investment.name}"? Its transaction history will be retained.`
        );

        if (!confirmed) return;

        await onClose(investment.id);
    };

    return (
        <div className="all-investments-page">
            <InvestmentPageHeader
                title="All Investments"
                description="Manage and monitor all your investments."
                buttonText="Create Investment"
                onButtonClick={handleAdd}
            />

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

            {error && (
                <div className="investment-page-error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

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
                            : "There are no investments in this section."}
                    </p>

                    {statusFilter === "active" && (
                        <button type="button" onClick={handleAdd}>
                            Create Investment
                        </button>
                    )}
                </div>
            ) : (
                <InvestmentSection
                    title={`${statusFilter === "all" ? "All" : statusFilter === "active" ? "Active" : "Closed"} Investments`}
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
                                onEdit={() => handleEdit(item.investment)}
                                onDelete={() =>
                                    handleDelete(item.investment)
                                }
                                onClose={() =>
                                    handleClose(item.investment)
                                }
                            />
                        ))}
                    </div>
                </InvestmentSection>
            )}

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
