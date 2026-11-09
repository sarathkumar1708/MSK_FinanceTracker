
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Activity,
    Plus,
    Pencil,
    Trash2,
    Lock,
    Unlock,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    Clock,
} from "lucide-react";

import { fetchActivityLogs } from "../../debtSlice";
import {
    DebtPageHeader,
    DebtSection,
} from "../../components/DebtShared/DebtShared";

import "./DebtActivityHistory.css";

const PAGE_SIZE = 10;

const ACTION_CONFIG = {
    INSERT: {
        label: "Created",
        icon: Plus,
        className: "activity-created",
    },
    UPDATE: {
        label: "Updated",
        icon: Pencil,
        className: "activity-updated",
    },
    DELETE: {
        label: "Deleted",
        icon: Trash2,
        className: "activity-deleted",
    },
    CLOSE: {
        label: "Closed",
        icon: Lock,
        className: "activity-closed",
    },
    REOPEN: {
        label: "Reopened",
        icon: Unlock,
        className: "activity-reopened",
    },
};

const ENTITY_LABELS = {
    debt: "Debt",
    monthly_snapshot: "Monthly Update",
    payment: "Payment",
};

const HIDDEN_FIELDS = [
    "id",
    "user_id",
    "debt_id",
    "snapshot_id",
    "created_at",
    "updated_at",
];

const FIELD_LABELS = {
    name: "Debt Name",
    lender: "Lender",
    debt_type: "Debt Type",
    original_amount: "Original Amount",
    interest_rate: "Interest Rate",
    start_date: "Start Date",
    status: "Status",
    opening_outstanding: "Opening Outstanding",
    closing_outstanding: "Closing Outstanding",
    month: "Month",
    amount: "Payment Amount",
    principal_amount: "Principal Amount",
    interest_amount: "Interest Amount",
    paid_date: "Payment Date",
    payment_type: "Payment Type",
    payment_mode: "Payment Mode",
    notes: "Notes",
};

const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return String(value);
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(number);
};

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatDateTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatFieldLabel = (field) => {
    return (
        FIELD_LABELS[field] ||
        field.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    );
};

const formatFieldValue = (field, value) => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    if (
        [
            "original_amount",
            "opening_outstanding",
            "closing_outstanding",
            "amount",
            "principal_amount",
            "interest_amount",
        ].includes(field)
    ) {
        return formatCurrency(value);
    }

    if (["start_date", "paid_date", "month"].includes(field)) {
        return formatDate(value);
    }

    if (field === "interest_rate") {
        return `${value}%`;
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return String(value);
};

const getRecordName = (activity) => {
    const data = activity.new_data || activity.old_data || {};

    return (
        data.name ||
        data.debt_name ||
        data.lender ||
        ENTITY_LABELS[activity.entity_type] ||
        "Record"
    );
};

const getActionConfig = (action) => {
    return (
        ACTION_CONFIG[String(action || "").toUpperCase()] || {
            label: action || "Activity",
            icon: Activity,
            className: "activity-default",
        }
    );
};

const getChangedFields = (activity) => {
    const oldData = activity.old_data || {};
    const newData = activity.new_data || {};

    const fields = new Set([
        ...Object.keys(oldData),
        ...Object.keys(newData),
    ]);

    return [...fields].filter((field) => {
        if (HIDDEN_FIELDS.includes(field)) return false;

        const oldValue = oldData[field];
        const newValue = newData[field];

        return JSON.stringify(oldValue ?? null) !==
            JSON.stringify(newValue ?? null);
    });
};

function ActivityChangeDetails({ activity }) {
    const changedFields = getChangedFields(activity);

    if (!changedFields.length) return null;

    const oldData = activity.old_data || {};
    const newData = activity.new_data || {};

    return (
        <div className="activity-changes">
            {changedFields.map((field) => (
                <div className="activity-change" key={field}>
                    <span className="activity-field-label">
                        {formatFieldLabel(field)}
                    </span>

                    <div className="activity-field-values">
                        {oldData[field] !== undefined && (
                            <span className="activity-old-value">
                                {formatFieldValue(field, oldData[field])}
                            </span>
                        )}

                        {oldData[field] !== undefined &&
                            newData[field] !== undefined && (
                                <span className="activity-change-arrow">
                                    →
                                </span>
                            )}

                        {newData[field] !== undefined && (
                            <span className="activity-new-value">
                                {formatFieldValue(field, newData[field])}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function ActivityCard({ activity }) {
    const config = getActionConfig(activity.action);
    const ActionIcon = config.icon;

    const entityLabel =
        ENTITY_LABELS[activity.entity_type] ||
        activity.entity_type ||
        "Record";

    const recordName = getRecordName(activity);

    return (
        <article className="activity-item">
            <div className={`activity-icon ${config.className}`}>
                <ActionIcon size={17} />
            </div>

            <div className="activity-content">
                <div className="activity-heading">
                    <div className="activity-heading-main">
                        <div className="activity-title-row">
                            <span className={`activity-action-badge ${config.className}`}>
                                {config.label}
                            </span>

                            <span className="activity-entity-badge">
                                {entityLabel}
                            </span>
                        </div>

                        <p className="activity-record-name">
                            {recordName}
                        </p>
                    </div>

                    <div className="activity-date">
                        <CalendarDays size={13} />
                        <span>{formatDateTime(activity.created_at)}</span>
                    </div>
                </div>

                <ActivityChangeDetails activity={activity} />
            </div>
        </article>
    );
}

export default function DebtActivityHistory() {
    const dispatch = useDispatch();

    const {
        activityLogs = [],
        activityLoading,
        error,
    } = useSelector((state) => state.debt);

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        dispatch(fetchActivityLogs());
    }, [dispatch]);

    // Always show newest activity first.
    const sortedActivities = useMemo(() => {
        return [...activityLogs].sort(
            (a, b) =>
                new Date(b.created_at || 0).getTime() -
                new Date(a.created_at || 0).getTime()
        );
    }, [activityLogs]);

    const totalActivities = sortedActivities.length;

    const totalPages = Math.ceil(totalActivities / PAGE_SIZE);

    const startIndex = (currentPage - 1) * PAGE_SIZE;

    const currentActivities = sortedActivities.slice(
        startIndex,
        startIndex + PAGE_SIZE
    );

    const firstActivity = totalActivities ? startIndex + 1 : 0;

    const lastActivity = Math.min(
        startIndex + PAGE_SIZE,
        totalActivities
    );

    // Keep current page valid if the activity count changes.
    useEffect(() => {
        if (currentPage > Math.max(totalPages, 1)) {
            setCurrentPage(Math.max(totalPages, 1));
        }
    }, [currentPage, totalPages]);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(
            totalPages,
            startPage + maxVisiblePages - 1
        );

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let page = startPage; page <= endPage; page++) {
            pages.push(page);
        }

        return pages;
    };

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;

        setCurrentPage(page);

        // Bring the activity section back into view.
        document
            .querySelector(".activity-history-section")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
    };

    return (
        <div className="debt-page debt-activity-page">
            <DebtPageHeader
                title="Activity History"
                description="Track all changes made to your debt records."
            />

            <DebtSection title="Recent Activities">
                <div className="activity-history-section">
                    <div className="activity-summary">
                        <div className="activity-summary-icon">
                            <Activity size={18} />
                        </div>

                        <div>
                            <strong>{totalActivities}</strong>
                            <span>Total Activities</span>
                        </div>

                        <div className="activity-summary-range">
                            Showing {firstActivity}–{lastActivity} of{" "}
                            {totalActivities}
                        </div>
                    </div>

                    {activityLoading ? (
                        <div className="activity-empty-state">
                            <div className="activity-loading-spinner" />
                            <h3>Loading activities</h3>
                            <p>Please wait while we load your activity history.</p>
                        </div>
                    ) : error ? (
                        <div className="activity-error">
                            {error}
                        </div>
                    ) : totalActivities === 0 ? (
                        <div className="activity-empty-state">
                            <Activity size={30} />
                            <h3>No activities yet</h3>
                            <p>
                                Your debt-related activities will appear here.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="activity-list">
                                {currentActivities.map((activity) => (
                                    <ActivityCard
                                        key={activity.id}
                                        activity={activity}
                                    />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="activity-pagination">
                                    <div className="activity-pagination-info">
                                        Showing{" "}
                                        <strong>{firstActivity}</strong> to{" "}
                                        <strong>{lastActivity}</strong> of{" "}
                                        <strong>{totalActivities}</strong>
                                    </div>

                                    <div className="activity-pagination-controls">
                                        <button
                                            type="button"
                                            className="activity-page-button activity-page-arrow"
                                            onClick={() =>
                                                goToPage(currentPage - 1)
                                            }
                                            disabled={currentPage === 1}
                                            aria-label="Previous page"
                                        >
                                            <ChevronLeft size={16} />
                                            <span>Previous</span>
                                        </button>

                                        {getPageNumbers().map((page) => (
                                            <button
                                                type="button"
                                                key={page}
                                                className={`activity-page-button ${currentPage === page
                                                        ? "active"
                                                        : ""
                                                    }`}
                                                onClick={() => goToPage(page)}
                                                aria-current={
                                                    currentPage === page
                                                        ? "page"
                                                        : undefined
                                                }
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        <button
                                            type="button"
                                            className="activity-page-button activity-page-arrow"
                                            onClick={() =>
                                                goToPage(currentPage + 1)
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            aria-label="Next page"
                                        >
                                            <span>Next</span>
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DebtSection>
        </div>
    );
}
