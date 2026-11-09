
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import {
    DebtPageHeader,
    DebtSection,
} from "../../components/DebtShared/DebtShared";

import DebtFormModal from "../../components/DebtFormModal/DebtFormModal";


import "./AllDebts.css";
import AllDebtCard from "../../components/AllDebtCard/AllDebtCard";

const getLatestSnapshot = (debtId, snapshots) => {
    return snapshots
        .filter((snapshot) => snapshot.debt_id === debtId)
        .sort((a, b) => b.month.localeCompare(a.month))[0];
};

const getPaymentMetrics = (debtId, payments) => {
    const debtPayments = payments.filter(
        (payment) => payment.debt_id === debtId
    );

    const sum = (items, field) =>
        items.reduce((total, item) => total + Number(item[field] || 0), 0);

    const recordedSum = (field) => {
        const recorded = debtPayments.filter(
            (payment) => payment[field] != null
        );

        return recorded.length ? sum(recorded, field) : null;
    };

    return {
        totalPrincipalPaid: recordedSum("principal_amount"),
        totalInterestPaid: recordedSum("interest_amount"),
        totalEmiPaid: debtPayments.some(
            (payment) => payment.payment_type === "EMI"
        )
            ? sum(
                debtPayments.filter(
                    (payment) => payment.payment_type === "EMI"
                ),
                "amount"
            )
            : null,
        totalRepayment: debtPayments.length
            ? sum(debtPayments, "amount")
            : null,
    };
};

export default function AllDebts({
    debts = [],
    monthlySnapshots = [],
    payments = [],
    onAdd,
    onEdit,
    onDelete,
    onClose,
    saving = false,
}) {
    const [search, setSearch] = useState("");
    const [type, setType] = useState("all");
    const [status, setStatus] = useState("all");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState(null);

    const debtTypes = useMemo(
        () => [...new Set(debts.map((debt) => debt.debt_type).filter(Boolean))],
        [debts]
    );

    const filteredDebts = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return debts.filter((debt) => {
            const matchesSearch =
                debt.name?.toLowerCase().includes(searchValue) ||
                debt.lender?.toLowerCase().includes(searchValue);

            const matchesType =
                type === "all" || debt.debt_type === type;

            const matchesStatus =
                status === "all" ||
                (status === "pending" && debt.status === "active") ||
                (status === "closed" && debt.status === "closed");

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [debts, search, type, status]);

    const handleAddClick = () => {
        setSelectedDebt(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (debt) => {
        setSelectedDebt(debt);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (!saving) {
            setIsModalOpen(false);
            setSelectedDebt(null);
        }
    };

    const handleSubmit = async (formData) => {
        if (selectedDebt) {
            if (!onEdit) {
                throw new Error("Edit Debt handler is not connected.");
            }

            await onEdit(selectedDebt.id, formData);
        } else {
            if (!onAdd) {
                throw new Error("Add Debt handler is not connected.");
            }

            await onAdd(formData);
        }

        setIsModalOpen(false);
        setSelectedDebt(null);
    };

    const clearFilters = () => {
        setSearch("");
        setType("all");
        setStatus("all");
    };

    const hasActiveFilters =
        search.trim() !== "" || type !== "all" || status !== "all";

    const pendingCount = debts.filter(
        (debt) => debt.status === "active"
    ).length;

    const closedCount = debts.filter(
        (debt) => debt.status === "closed"
    ).length;

    return (
        <div className="debt-page all-debts-page">
            <DebtPageHeader
                title="All Debts"
                description="View and manage your loans, repayments and outstanding balances."
                actionLabel="Add New Debt"
                onAction={handleAddClick}
            />

            <DebtSection title="Loan Overview">
                <div className="debt-status-tabs">
                    <button
                        type="button"
                        className={status === "all" ? "active" : ""}
                        onClick={() => setStatus("all")}
                    >
                        All Debts <span>{debts.length}</span>
                    </button>

                    <button
                        type="button"
                        className={status === "pending" ? "active" : ""}
                        onClick={() => setStatus("pending")}
                    >
                        Pending <span>{pendingCount}</span>
                    </button>

                    <button
                        type="button"
                        className={status === "closed" ? "active" : ""}
                        onClick={() => setStatus("closed")}
                    >
                        Closed <span>{closedCount}</span>
                    </button>
                </div>

                <div className="debt-toolbar">
                    <div className="debt-toolbar-left">
                        <div className="debt-search">
                            <Search
                                size={18}
                                className="debt-search-icon"
                            />

                            <input
                                type="search"
                                placeholder="Search debts or lenders..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                            />
                        </div>

                        <div className="debt-filter">
                            <label htmlFor="debt-type-filter">
                                <SlidersHorizontal size={14} />
                                Debt Type
                            </label>

                            <select
                                id="debt-type-filter"
                                value={type}
                                onChange={(event) =>
                                    setType(event.target.value)
                                }
                            >
                                <option value="all">All Types</option>

                                {debtTypes.map((item) => (
                                    <option key={item} value={item}>
                                        {item
                                            .replaceAll("_", " ")
                                            .replace(/\b\w/g, (char) =>
                                                char.toUpperCase()
                                            )}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                className="debt-clear-filters"
                                onClick={clearFilters}
                            >
                                Clear filters
                            </button>
                        )}
                    </div>

                    <div className="debt-results-count">
                        Showing <strong>{filteredDebts.length}</strong> of{" "}
                        <strong>{debts.length}</strong> debts
                    </div>
                </div>

                {filteredDebts.length === 0 ? (
                    <div className="debt-empty-state">
                        No debt records found.
                    </div>
                ) : (
                    <div className="debt-card-grid">
                        {filteredDebts.map((debt) => {
                            const latestSnapshot = getLatestSnapshot(
                                debt.id,
                                monthlySnapshots
                            );

                            const metrics = getPaymentMetrics(
                                debt.id,
                                payments
                            );

                            return (
                                <AllDebtCard
                                    key={debt.id}
                                    debt={debt}
                                    currentOutstanding={
                                        latestSnapshot?.closing_outstanding ?? null
                                    }
                                    totalPrincipalPaid={
                                        metrics.totalPrincipalPaid
                                    }
                                    totalInterestPaid={
                                        metrics.totalInterestPaid
                                    }
                                    totalEmiPaid={metrics.totalEmiPaid}
                                    totalRepayment={metrics.totalRepayment}
                                    onEdit={handleEditClick}
                                    onDelete={onDelete}
                                    onClose={onClose}
                                />
                            );
                        })}
                    </div>
                )}
            </DebtSection>

            <DebtFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                debt={selectedDebt}
                loading={saving}
            />
        </div>
    );
}
