
import { useMemo, useState } from "react";
import {
    ArrowLeft,
    Plus,
    Wallet,
    TrendingUp,
    TrendingDown,
    IndianRupee,
    Pencil,
    Trash2,
    CalendarDays,
    CircleDollarSign,
} from "lucide-react";

import BudgetFormModal from "../../components/BudgetFormModal/BudgetFormModal";
import IncomeFormModal from "../../components/IncomeFormModal/IncomeFormModal";

import "./MonthlyBudget.css";

const formatCurrency = (value = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);

export default function MonthlyBudget({
    year,
    month,
    selectedMonth,
    incomes = [],
    budgetItems = [],
    categories = [],
    loading,
    categoriesLoading,
    saving,
    error,
    onBack,
    onCreateIncome,
    onUpdateIncome,
    onDeleteIncome,
    onCreateBudget,
    onUpdateBudget,
    onDeleteBudget,
}) {
    const [activeTab, setActiveTab] = useState("expenses");

    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);

    const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
    const [editingIncome, setEditingIncome] = useState(null);

    const totals = useMemo(() => {
        const totalIncome = incomes.reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0
        );

        const plannedBudget = budgetItems.reduce(
            (sum, item) => sum + Number(item.planned_amount || 0),
            0
        );

        return {
            totalIncome,
            plannedBudget,
            balance: totalIncome - plannedBudget,
        };
    }, [incomes, budgetItems]);

    /* =========================
       BUDGET MODAL HANDLERS
    ========================= */

    const handleOpenAddBudget = () => {
        setEditingBudget(null);
        setIsBudgetModalOpen(true);
    };

    const handleOpenEditBudget = (item) => {
        setEditingBudget(item);
        setIsBudgetModalOpen(true);
    };

    const handleCloseBudgetModal = () => {
        if (saving) return;
        setIsBudgetModalOpen(false);
        setEditingBudget(null);
    };

    const handleSubmitBudget = async (formData) => {
        if (editingBudget) {
            await onUpdateBudget?.(editingBudget.id, formData);
        } else {
            if (!selectedMonth?.id) {
                throw new Error("Monthly budget record not found.");
            }

            await onCreateBudget?.({
                ...formData,
                budget_month_id: selectedMonth.id,
            });
        }

        setIsBudgetModalOpen(false);
        setEditingBudget(null);
    };

    /* =========================
       INCOME MODAL HANDLERS
    ========================= */

    const handleOpenAddIncome = () => {
        setEditingIncome(null);
        setIsIncomeModalOpen(true);
    };

    const handleOpenEditIncome = (income) => {
        setEditingIncome(income);
        setIsIncomeModalOpen(true);
    };

    const handleCloseIncomeModal = () => {
        if (saving) return;
        setIsIncomeModalOpen(false);
        setEditingIncome(null);
    };

    const handleSubmitIncome = async (formData) => {
        if (editingIncome) {
            await onUpdateIncome?.(editingIncome.id, formData);
        } else {
            if (!selectedMonth?.id) {
                throw new Error("Monthly budget record not found.");
            }

            await onCreateIncome?.({
                ...formData,
                budget_month_id: selectedMonth.id,
            });
        }

        setIsIncomeModalOpen(false);
        setEditingIncome(null);
    };

    const handleDeleteIncome = async (income) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${income.income_title}"?`
        );

        if (!confirmed) return;

        try {
            await onDeleteIncome?.(income.id);
        } catch (err) {
            console.error("Unable to delete income:", err);
            window.alert(err?.message || "Unable to delete income.");
        }
    };

    const handleDeleteBudget = async (item) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${item.category?.name || "this budget"}"?`
        );

        if (!confirmed) return;

        try {
            await onDeleteBudget?.(item.id);
        } catch (err) {
            console.error("Unable to delete budget:", err);
            window.alert(err?.message || "Unable to delete budget.");
        }
    };

    const monthName = new Date(year, month - 1).toLocaleString("en-IN", {
        month: "long",
    });

    if (loading) {
        return (
            <div className="monthly-budget-loading">
                Loading monthly budget...
            </div>
        );
    }

    return (
        <div className="monthly-budget-page">
            {/* HEADER */}

            <div className="monthly-budget-header">
                <div className="monthly-budget-heading">
                    <button
                        className="monthly-back-button"
                        onClick={onBack}
                        type="button"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div>
                        <div className="monthly-title-row">
                            <h1>{monthName} {year}</h1>
                            <span className="monthly-status-badge">
                                Monthly Planner
                            </span>
                        </div>

                        <p>Plan and manage your monthly income and expenses.</p>
                    </div>
                </div>

                <div className="monthly-header-actions">
                    <button
                        className="monthly-secondary-button"
                        type="button"
                        onClick={handleOpenAddIncome}
                    >
                        <Plus size={17} />
                        Add Income
                    </button>

                    <button
                        className="monthly-primary-button"
                        type="button"
                        onClick={handleOpenAddBudget}
                    >
                        <Plus size={17} />
                        Add Budget
                    </button>
                </div>
            </div>

            {error && (
                <div className="monthly-budget-error">
                    {typeof error === "string" ? error : error.message}
                </div>
            )}

            {/* SUMMARY CARDS */}

            <div className="monthly-summary-grid">
                <div className="monthly-summary-card income-summary">
                    <div className="monthly-summary-top">
                        <div className="monthly-summary-icon">
                            <TrendingUp size={21} />
                        </div>
                        <span>Total Income</span>
                    </div>

                    <h2>{formatCurrency(totals.totalIncome)}</h2>
                    <p>All monthly income sources</p>
                </div>

                <div className="monthly-summary-card expense-summary">
                    <div className="monthly-summary-top">
                        <div className="monthly-summary-icon">
                            <TrendingDown size={21} />
                        </div>
                        <span>Planned Budget</span>
                    </div>

                    <h2>{formatCurrency(totals.plannedBudget)}</h2>
                    <p>Total planned expenses</p>
                </div>

                <div className="monthly-summary-card balance-summary">
                    <div className="monthly-summary-top">
                        <div className="monthly-summary-icon">
                            <CircleDollarSign size={21} />
                        </div>
                        <span>Remaining Balance</span>
                    </div>

                    <h2>{formatCurrency(totals.balance)}</h2>
                    <p>Income minus planned budget</p>
                </div>
            </div>

            {/* TABS */}

            <div className="monthly-budget-tabs">
                <button
                    type="button"
                    className={activeTab === "expenses" ? "active" : ""}
                    onClick={() => setActiveTab("expenses")}
                >
                    <Wallet size={17} />
                    Planned Budget
                    <span>{budgetItems.length}</span>
                </button>

                <button
                    type="button"
                    className={activeTab === "income" ? "active" : ""}
                    onClick={() => setActiveTab("income")}
                >
                    <IndianRupee size={17} />
                    Income Sources
                    <span>{incomes.length}</span>
                </button>
            </div>

            {/* BUDGET TABLE */}

            {activeTab === "expenses" && (
                <section className="monthly-budget-section">
                    <div className="monthly-section-header">
                        <div>
                            <h2>Planned Expenses</h2>
                            <p>Manage your category-wise monthly budget.</p>
                        </div>

                        <button
                            className="monthly-primary-button"
                            type="button"
                            onClick={handleOpenAddBudget}
                        >
                            <Plus size={16} />
                            Add Budget
                        </button>
                    </div>

                    {budgetItems.length === 0 ? (
                        <div className="monthly-empty-state">
                            <Wallet size={34} />
                            <h3>No budget added yet</h3>
                            <p>Start by adding your first planned expense.</p>
                            <button
                                type="button"
                                className="monthly-primary-button"
                                onClick={handleOpenAddBudget}
                            >
                                <Plus size={16} />
                                Create Budget
                            </button>
                        </div>
                    ) : (
                        <div className="monthly-table-wrapper">
                            <table className="monthly-budget-table">
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Category Group</th>
                                        <th>Planned Amount</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {budgetItems.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <strong>{item.category?.name || "Uncategorized"}</strong>
                                            </td>

                                            <td>
                                                <span className="monthly-category-group">
                                                    {item.category?.category_group || "Other"}
                                                </span>
                                            </td>

                                            <td className="monthly-amount-cell">
                                                {formatCurrency(item.planned_amount)}
                                            </td>

                                            <td>
                                                <div className="monthly-row-actions">
                                                    <button
                                                        type="button"
                                                        title="Edit budget"
                                                        onClick={() => handleOpenEditBudget(item)}
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title="Delete budget"
                                                        onClick={() => handleDeleteBudget(item)}
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
                    )}
                </section>
            )}

            {/* INCOME TABLE */}

            {activeTab === "income" && (
                <section className="monthly-budget-section">
                    <div className="monthly-section-header">
                        <div>
                            <h2>Income Sources</h2>
                            <p>Manage all your income sources for this month.</p>
                        </div>

                        <button
                            className="monthly-primary-button"
                            type="button"
                            onClick={handleOpenAddIncome}
                        >
                            <Plus size={16} />
                            Add Income
                        </button>
                    </div>

                    {incomes.length === 0 ? (
                        <div className="monthly-empty-state">
                            <IndianRupee size={34} />
                            <h3>No income added yet</h3>
                            <p>Add your salary or other income sources.</p>
                            <button
                                type="button"
                                className="monthly-primary-button"
                                onClick={handleOpenAddIncome}
                            >
                                <Plus size={16} />
                                Add Income
                            </button>
                        </div>
                    ) : (
                        <div className="monthly-table-wrapper">
                            <table className="monthly-budget-table">
                                <thead>
                                    <tr>
                                        <th>Income Source</th>
                                        <th>Notes</th>
                                        <th>Amount</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {incomes.map((income) => (
                                        <tr key={income.id}>
                                            <td>
                                                <div className="monthly-income-name">
                                                    <span className="monthly-income-icon">
                                                        <IndianRupee size={15} />
                                                    </span>
                                                    <strong>{income.income_title}</strong>
                                                </div>
                                            </td>

                                            <td>{income.notes || "—"}</td>

                                            <td className="monthly-amount-cell">
                                                {formatCurrency(income.amount)}
                                            </td>

                                            <td>
                                                <div className="monthly-row-actions">
                                                    <button
                                                        type="button"
                                                        title="Edit income"
                                                        onClick={() => handleOpenEditIncome(income)}
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title="Delete income"
                                                        onClick={() => handleDeleteIncome(income)}
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
                    )}
                </section>
            )}

            {/* MODALS */}

            <BudgetFormModal
                isOpen={isBudgetModalOpen}
                onClose={handleCloseBudgetModal}
                onSubmit={handleSubmitBudget}
                categories={categories}
                budgetItem={editingBudget}
                saving={saving || categoriesLoading}
            />

            <IncomeFormModal
                isOpen={isIncomeModalOpen}
                onClose={handleCloseIncomeModal}
                onSubmit={handleSubmitIncome}
                income={editingIncome}
                saving={saving}
            />
        </div>
    );
}
