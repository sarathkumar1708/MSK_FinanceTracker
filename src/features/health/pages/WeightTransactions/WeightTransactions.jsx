
import React, { useMemo, useState } from "react";
import {
    ArrowLeft,
    CalendarDays,
    Scale,
    Target,
    TrendingDown,
    TrendingUp,
    Plus,
    Activity,
    Ruler,
} from "lucide-react";

import WeightHistoryTable from "../../components/WeightHistoryTable/WeightHistoryTable";
import UpdateWeightModal from "../../components/UpdateWeightModal/UpdateWeightModal";

import "./WeightTransactions.css";

// ============================================
// CONSTANTS
// ============================================

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const CURRENT_DATE = new Date();
const CURRENT_MONTH = String(CURRENT_DATE.getMonth() + 1);
const CURRENT_YEAR = String(CURRENT_DATE.getFullYear());

// ============================================
// HELPERS
// ============================================

const formatWeight = (value) => {
    const weight = Number(value);

    return Number.isFinite(weight)
        ? `${weight.toFixed(1)} kg`
        : "0.0 kg";
};

const formatDate = (value) => {
    if (!value) return "Not set";

    return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

// ============================================
// MAIN COMPONENT
// ============================================

function WeightTransactions({
    journey,
    transactions = [],
    loading = false,
    saving = false,
    onBack,
    onSaveWeight,
    onDeleteWeight,
}) {
    const [showWeightModal, setShowWeightModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    // ========================================
    // MONTH AND YEAR FILTER STATE
    // Defaults to current month and year
    // ========================================

    const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);
    const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);

    // ========================================
    // SORT ALL TRANSACTIONS
    // ========================================

    const sortedTransactions = useMemo(() => {
        return [...transactions].sort((a, b) =>
            (b.update_date || "").localeCompare(a.update_date || "")
        );
    }, [transactions]);

    // ========================================
    // AVAILABLE YEARS
    // ========================================

    const availableYears = useMemo(() => {
        const years = transactions
            .map((item) => Number(item.update_date?.substring(0, 4)))
            .filter((year) => Number.isFinite(year) && year > 0);

        return [...new Set([
            Number(CURRENT_YEAR),
            ...years,
        ])].sort((a, b) => b - a);
    }, [transactions]);

    // ========================================
    // FILTER TRANSACTIONS BY MONTH AND YEAR
    // ========================================

    const filteredTransactions = useMemo(() => {
        return sortedTransactions.filter((item) => {
            if (!item.update_date) return false;

            const [year, month] = item.update_date.split("-");

            return (
                year === selectedYear &&
                month === selectedMonth.padStart(2, "0")
            );
        });
    }, [sortedTransactions, selectedMonth, selectedYear]);

    // ========================================
    // CURRENT WEIGHT
    // Always based on latest transaction
    // ========================================

    const currentWeight = useMemo(() => {
        if (sortedTransactions.length > 0) {
            return Number(sortedTransactions[0].weight) || 0;
        }

        return (
            Number(journey?.last_updated_weight) ||
            Number(journey?.initial_weight) ||
            0
        );
    }, [sortedTransactions, journey]);

    // ========================================
    // WEIGHT CALCULATIONS
    // ========================================

    const initialWeight = Number(journey?.initial_weight) || 0;
    const targetWeight = Number(journey?.target_weight) || 0;

    const weightDifference = initialWeight - currentWeight;
    const isWeightLoss = weightDifference >= 0;

    const progress = useMemo(() => {
        const total = initialWeight - targetWeight;

        if (total <= 0) return 0;

        return Math.min(
            100,
            Math.max(
                0,
                ((initialWeight - currentWeight) / total) * 100
            )
        );
    }, [initialWeight, targetWeight, currentWeight]);

    // ========================================
    // MODAL HANDLERS
    // ========================================

    const handleAddWeight = () => {
        setEditingTransaction(null);
        setShowWeightModal(true);
    };

    const handleEditWeight = (transaction) => {
        setEditingTransaction(transaction);
        setShowWeightModal(true);
    };

    const handleCloseModal = () => {
        if (saving) return;

        setShowWeightModal(false);
        setEditingTransaction(null);
    };

    const handleSaveWeight = async (payload) => {
        await onSaveWeight(payload);

        setShowWeightModal(false);
        setEditingTransaction(null);
    };

    // ========================================
    // JOURNEY NOT FOUND
    // ========================================

    if (!journey) {
        return (
            <div className="weight-transactions-empty">
                <Activity size={34} />

                <h3>Journey not found</h3>

                <p>
                    The selected weightloss journey could not be loaded.
                </p>

                <button
                    className="weight-back-btn"
                    onClick={onBack}
                >
                    <ArrowLeft size={17} />
                    Back to Journeys
                </button>
            </div>
        );
    }

    // ========================================
    // RENDER
    // ========================================

    return (
        <div className="weight-transactions-page">

            {/* PAGE HEADER */}

            <div className="weight-page-header">

                <div className="weight-header-left">

                    <button
                        type="button"
                        className="weight-back-icon"
                        onClick={onBack}
                        title="Back to journeys"
                    >
                        <ArrowLeft size={19} />
                    </button>

                    <div>
                        <div className="weight-page-eyebrow">
                            <Activity size={14} />
                            WEIGHTLOSS TRACKER
                        </div>

                        <h2>{journey.journey_name}</h2>

                        <p>
                            Track your progress and keep moving towards your target.
                        </p>
                    </div>

                </div>

                <button
                    type="button"
                    className="weight-add-btn"
                    onClick={handleAddWeight}
                >
                    <Plus size={18} />
                    Update Weight
                </button>

            </div>

            {/* JOURNEY INFORMATION */}

            <div className="weight-journey-info">

                <div className="weight-info-item">
                    <CalendarDays size={17} />

                    <div>
                        <span>Journey Period</span>

                        <strong>
                            {formatDate(journey.from_date)} - {formatDate(journey.to_date)}
                        </strong>
                    </div>
                </div>

                <div className="weight-info-item">
                    <Ruler size={17} />

                    <div>
                        <span>Height</span>

                        <strong>
                            {Number(journey.height_cm || 0).toFixed(1)} cm
                        </strong>
                    </div>
                </div>

                <div className="weight-info-item">
                    <Activity size={17} />

                    <div>
                        <span>Entries Recorded</span>

                        <strong>
                            {transactions.length} updates
                        </strong>
                    </div>
                </div>

            </div>

            {/* SUMMARY CARDS */}

            <div className="weight-summary-grid">

                {/* INITIAL WEIGHT */}

                <div className="weight-summary-card initial">

                    <div className="weight-summary-top">
                        <div className="weight-summary-icon">
                            <Scale size={21} />
                        </div>

                        <span>Starting Point</span>
                    </div>

                    <h3>{formatWeight(initialWeight)}</h3>

                    <p>Initial Weight</p>

                </div>

                {/* TARGET WEIGHT */}

                <div className="weight-summary-card target">

                    <div className="weight-summary-top">
                        <div className="weight-summary-icon">
                            <Target size={21} />
                        </div>

                        <span>Your Goal</span>
                    </div>

                    <h3>{formatWeight(targetWeight)}</h3>

                    <p>Target Weight</p>

                </div>

                {/* Reduce WEIGHT */}

                <div className="weight-summary-card target">

                    <div className="weight-summary-top">
                        <div className="weight-summary-icon">
                            <Target size={21} />
                        </div>

                        <span>Need to Reduce Weight</span>
                    </div>

                    <h3>{formatWeight(initialWeight - targetWeight)}</h3>

                    <p>Reduce Weight</p>

                </div>

                {/* CURRENT WEIGHT */}

                <div
                    className={`weight-summary-card ${currentWeight > targetWeight
                        ? "current-warning"
                        : "current"
                        }`}
                >

                    <div className="weight-summary-top">
                        <div className="weight-summary-icon">
                            <Activity size={21} />
                        </div>

                        <span>
                            {currentWeight > targetWeight
                                ? "Above Target"
                                : "Latest Update"}
                        </span>
                    </div>

                    <h3>{formatWeight(currentWeight)}</h3>

                    <p>Current Weight</p>

                </div>

                {/* WEIGHT LOSS */}

                <div
                    className={`weight-summary-card ${isWeightLoss ? "loss" : "gain"
                        }`}
                >

                    <div className="weight-summary-top">

                        <div className="weight-summary-icon">
                            {isWeightLoss ? (
                                <TrendingDown size={21} />
                            ) : (
                                <TrendingUp size={21} />
                            )}
                        </div>

                        <span>
                            {isWeightLoss
                                ? "Progress Made"
                                : "Weight Change"}
                        </span>

                    </div>

                    <h3>
                        {weightDifference > 0 ? "+" : ""}
                        {formatWeight(weightDifference)}
                    </h3>

                    <p>
                        {isWeightLoss
                            ? "Total Weight Loss"
                            : "Weight Gained"}
                    </p>

                </div>

            </div>

            {/* PROGRESS */}

            <div className="weight-progress-card">

                <div className="weight-progress-heading">

                    <div>
                        <span className="weight-section-eyebrow">
                            YOUR JOURNEY
                        </span>

                        <h3>Weight Loss Progress</h3>
                    </div>

                    <strong>{progress.toFixed(1)}%</strong>

                </div>

                <div className="weight-progress-track">
                    <div
                        className="weight-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="weight-progress-labels">
                    <span>
                        Starting: {formatWeight(initialWeight)}
                    </span>

                    <span>
                        Current: {formatWeight(currentWeight)}
                    </span>

                    <span>
                        Target: {formatWeight(targetWeight)}
                    </span>
                </div>

            </div>

            {/* WEIGHT HISTORY */}

            <div className="weight-history-section">

                <div className="weight-history-heading">

                    <div>
                        <span className="weight-section-eyebrow">
                            DAILY RECORDS
                        </span>

                        <h3>Weight History</h3>

                        <p>
                            Review and manage your recorded weight updates.
                        </p>
                    </div>

                    {/* MONTH AND YEAR FILTERS */}

                    <div className="weight-history-filters">

                        <div className="weight-filter-field">
                            <label htmlFor="weight-filter-month">
                                Month
                            </label>

                            <select
                                id="weight-filter-month"
                                value={selectedMonth}
                                onChange={(e) =>
                                    setSelectedMonth(e.target.value)
                                }
                            >
                                {MONTHS.map((month, index) => (
                                    <option
                                        key={month}
                                        value={String(index + 1)}
                                    >
                                        {month}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="weight-filter-field">
                            <label htmlFor="weight-filter-year">
                                Year
                            </label>

                            <select
                                id="weight-filter-year"
                                value={selectedYear}
                                onChange={(e) =>
                                    setSelectedYear(e.target.value)
                                }
                            >
                                {availableYears.map((year) => (
                                    <option
                                        key={year}
                                        value={String(year)}
                                    >
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <span className="weight-record-count">
                            {filteredTransactions.length} Records
                        </span>

                    </div>

                </div>

                {/* FILTERED TABLE */}

                {loading ? (

                    <div className="weight-loading">
                        <span className="weight-loading-spinner" />

                        Loading weight history...
                    </div>

                ) : (

                    <WeightHistoryTable
                        transactions={filteredTransactions}
                        initialWeight={initialWeight}
                        onEdit={handleEditWeight}
                        onDelete={onDeleteWeight}
                    />

                )}

            </div>

            {/* UPDATE WEIGHT MODAL */}

            <UpdateWeightModal
                isOpen={showWeightModal}
                onClose={handleCloseModal}
                onSave={handleSaveWeight}
                saving={saving}
                journey={journey}
                transaction={editingTransaction}
            />

        </div>
    );
}

export default WeightTransactions;
