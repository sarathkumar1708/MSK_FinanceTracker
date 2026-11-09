
import { useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    DebtPageHeader,
    DebtSection,
    formatCurrency,
} from "../../components/DebtShared/DebtShared";

import { fetchDebtData } from "../../debtSlice";
import "./DebtOverview.css";

const formatDate = (date) => {
    if (!date) return "—";

    return new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};

export default function DebtOverview() {
    const dispatch = useDispatch();

    const {
        debts = [],
        monthlySnapshots = [],
        payments = [],
        loading,
    } = useSelector((state) => state.debt);

    useEffect(() => {
        dispatch(fetchDebtData());
    }, [dispatch]);

    // Separate active and closed debts
    const activeDebtList = useMemo(
        () => debts.filter((debt) => debt.status !== "closed"),
        [debts]
    );

    const closedDebtList = useMemo(
        () => debts.filter((debt) => debt.status === "closed"),
        [debts]
    );

    // Active debt IDs
    const activeDebtIds = useMemo(
        () => new Set(activeDebtList.map((debt) => debt.id)),
        [activeDebtList]
    );

    // Latest monthly snapshot for each active debt
    const latestSnapshots = useMemo(() => {
        const latestMap = {};

        monthlySnapshots.forEach((snapshot) => {
            if (!activeDebtIds.has(snapshot.debt_id)) return;

            const existing = latestMap[snapshot.debt_id];

            if (!existing || snapshot.month > existing.month) {
                latestMap[snapshot.debt_id] = snapshot;
            }
        });

        return latestMap;
    }, [monthlySnapshots, activeDebtIds]);

    // Attach latest outstanding to active debts.
    // If no monthly snapshot exists, use the original loan amount.
    const debtOverview = useMemo(() => {
        return activeDebtList.map((debt) => {
            const latestSnapshot = latestSnapshots[debt.id];

            const outstanding =
                latestSnapshot?.closing_outstanding != null
                    ? Number(latestSnapshot.closing_outstanding)
                    : Number(debt.original_amount || 0);

            return {
                ...debt,
                outstanding,
            };
        });
    }, [activeDebtList, latestSnapshots]);

    // Active debt loan amount only
    const totalLoanAmount = activeDebtList.reduce(
        (sum, debt) => sum + Number(debt.original_amount || 0),
        0
    );

    // Active debt outstanding only
    const totalOutstanding = debtOverview.reduce(
        (sum, debt) => sum + (debt.outstanding ?? 0),
        0
    );

    // Payments belonging to active debts only
    const activePayments = payments.filter((payment) =>
        activeDebtIds.has(payment.debt_id)
    );

    const totalPaid = activePayments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
    );

    const totalPrincipalPaid = activePayments.reduce(
        (sum, payment) => sum + Number(payment.principal_amount || 0),
        0
    );

    const totalInterestPaid = activePayments.reduce(
        (sum, payment) => sum + Number(payment.interest_amount || 0),
        0
    );

    // Debt counts
    const activeDebts = activeDebtList.length;
    const closedDebts = closedDebtList.length;

    // Active debts with monthly outstanding records
    const outstandingDebts = debtOverview.filter(
        (debt) => debt.outstanding > 0
    );
    
    // Recent payments from active debts only
    const sortedPayments = [...activePayments].sort((a, b) =>
        (b.paid_date || "").localeCompare(a.paid_date || "")
    );

    const debtNameMap = Object.fromEntries(
        debts.map((debt) => [debt.id, debt.name])
    );

    return (
        <div className="debt-page debt-overview-page">
            <DebtPageHeader
                title="Debt Overview"
                description="Track your active debt, repayments and financial progress."
            />

            {/* Main Summary */}
            <DebtSection title="Overall Debt Summary">
                <div className="debt-overview-summary-grid">
                    <div className="debt-overview-summary-card loan">
                        <span>Total Loan Amount</span>
                        <strong>{formatCurrency(totalLoanAmount)}</strong>
                    </div>

                    <div className="debt-overview-summary-card outstanding">
                        <span>Current Outstanding</span>
                        <strong>{formatCurrency(totalOutstanding)}</strong>
                    </div>

                    <div className="debt-overview-summary-card paid">
                        <span>Total Repaid</span>
                        <strong>{formatCurrency(totalPaid)}</strong>
                    </div>

                    <div className="debt-overview-summary-card principal">
                        <span>Principal Paid</span>
                        <strong>{formatCurrency(totalPrincipalPaid)}</strong>
                    </div>

                    <div className="debt-overview-summary-card interest">
                        <span>Interest Paid</span>
                        <strong>{formatCurrency(totalInterestPaid)}</strong>
                    </div>

                    <div className="debt-overview-summary-card count">
                        <span>Total Payments</span>
                        <strong>{activePayments.length}</strong>
                    </div>
                </div>
            </DebtSection>

            {/* Debt Status */}
            <DebtSection title="Debt Status">
                <div className="debt-overview-status-grid">
                    <div className="debt-overview-status-card">
                        <span>Pending Debts</span>
                        <strong>{activeDebts}</strong>
                    </div>

                    <div className="debt-overview-status-card">
                        <span>Closed Debts</span>
                        <strong>{closedDebts}</strong>
                    </div>

                    <div className="debt-overview-status-card">
                        <span>Total Debts</span>
                        <strong>{debts.length}</strong>
                    </div>
                </div>
            </DebtSection>

            {/* Outstanding by Active Debt */}
            <DebtSection title="Outstanding by Debt">
                <div className="debt-overview-list">
                    {outstandingDebts.map((debt) => {
                        const percentage = totalOutstanding
                            ? (debt.outstanding / totalOutstanding) * 100
                            : 0;

                        return (
                            <div
                                key={debt.id}
                                className="debt-progress-item"
                            >
                                <div className="debt-progress-heading">
                                    <strong>{debt.name}</strong>
                                    <span>
                                        {formatCurrency(debt.outstanding)}
                                    </span>
                                </div>

                                <div className="debt-progress-track">
                                    <div
                                        className="debt-progress-fill"
                                        style={{
                                            width: `${percentage}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}

                    {outstandingDebts.length === 0 && (
                        <p>No active monthly outstanding records available.</p>
                    )}
                </div>
            </DebtSection>

            {/* Recent Payments */}
            <DebtSection title="Recent Payments">
                {sortedPayments.slice(0, 5).map((payment) => (
                    <div
                        key={payment.id}
                        className="debt-payment-row"
                    >
                        <div>
                            <strong>
                                {debtNameMap[payment.debt_id] || "Unknown Debt"}
                            </strong>
                            <small>
                                {formatDate(payment.paid_date)}
                            </small>
                        </div>

                        <div className="debt-payment-details">
                            <strong>
                                {formatCurrency(payment.amount)}
                            </strong>
                            <small>
                                {payment.payment_type || "Payment"}
                            </small>
                        </div>
                    </div>
                ))}

                {activePayments.length === 0 && (
                    <p>No active debt payments recorded yet.</p>
                )}
            </DebtSection>
        </div>
    );
}
