
import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "../DebtShared/DebtShared";
import "./DebtTable.css";

export default function DebtTable({
    debts = [],
    monthlySnapshots = [],
    payments = [],
    onEdit,
    onDelete,
    onPayment,
}) {
    const getLatestSnapshot = (debtId) => {
        return monthlySnapshots
            .filter((snapshot) => snapshot.debt_id === debtId)
            .sort(
                (a, b) => new Date(b.month) - new Date(a.month)
            )[0];
    };

    const getDebtPayments = (debtId) => {
        return payments.filter(
            (payment) => payment.debt_id === debtId
        );
    };

    const getPaymentTotal = (debtPayments, type) => {
        const matchingPayments = debtPayments.filter(
            (payment) => payment.payment_type === type
        );

        if (matchingPayments.length === 0) return "—";

        const total = matchingPayments.reduce(
            (sum, payment) => sum + Number(payment.amount || 0),
            0
        );

        return formatCurrency(total);
    };

    const getRecordedBreakdown = (debtPayments, field) => {
        const recordedPayments = debtPayments.filter(
            (payment) =>
                payment[field] !== null &&
                payment[field] !== undefined
        );

        if (recordedPayments.length === 0) return "—";

        const total = recordedPayments.reduce(
            (sum, payment) => sum + Number(payment[field] || 0),
            0
        );

        return formatCurrency(total);
    };

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getPaidAfterOutstanding = (debtPayments) => {
        const latestPaymentWithBalance = [...debtPayments]
            .filter(
                (payment) =>
                    payment.balance_after_payment !== null &&
                    payment.balance_after_payment !== undefined
            )
            .sort(
                (a, b) =>
                    new Date(b.paid_date) - new Date(a.paid_date)
            )[0];

        return latestPaymentWithBalance
            ? formatCurrency(
                latestPaymentWithBalance.balance_after_payment
            )
            : "—";
    };

    const renderValueBadge = (value, colorClass) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—";
        }

        return (
            <span className={`debt-value ${colorClass}`}>
                {value}
            </span>
        );
    };

    return (
        <div className="debt-table-wrapper">
            <table className="debt-table">
                <thead>
                    <tr>
                        <th>S No</th>
                        <th>Debt Name</th>
                        <th>Lender</th>
                        <th>Debt Type</th>
                        <th>Interest Rate</th>
                        <th>Original Amount</th>
                        <th>Created At</th>
                        <th>Current Outstanding</th>
                        <th>Paid EMI</th>
                        <th>Part Payment</th>
                        <th>Principal Paid</th>
                        <th>Interest Paid</th>
                        <th>Paid After Outstanding</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {debts.length > 0 ? (
                        debts.map((debt, index) => {
                            const latestSnapshot = getLatestSnapshot(debt.id);
                            const debtPayments = getDebtPayments(debt.id);

                            const currentOutstanding =
                                latestSnapshot?.closing_outstanding;

                            return (
                                <tr key={debt.id}>
                                    <td>{index + 1}</td>

                                    <td>
                                        <strong>{debt.name}</strong>
                                    </td>

                                    <td>{debt.lender || "—"}</td>

                                    <td>{debt.debt_type || "—"}</td>

                                    <td>
                                        {renderValueBadge(
                                            debt.interest_rate !== null && debt.interest_rate !== undefined
                                                ? `${debt.interest_rate}%`
                                                : null,
                                            "debt-value-red"
                                        )}
                                    </td>

                                    <td>
                                        {renderValueBadge(
                                            debt.original_amount !== null && debt.original_amount !== undefined
                                                ? formatCurrency(debt.original_amount)
                                                : null,
                                            "debt-value-blue"
                                        )}
                                    </td>

                                    <td>
                                        {formatDate(debt.created_at)}
                                    </td>

                                    <td>
                                        {renderValueBadge(
                                            currentOutstanding !== null && currentOutstanding !== undefined
                                                ? formatCurrency(currentOutstanding)
                                                : null,
                                            "debt-value-red"
                                        )}
                                    </td>

                                    <td>
                                        {renderValueBadge(
                                            getPaymentTotal(debtPayments, "EMI") === "—"
                                                ? null
                                                : getPaymentTotal(debtPayments, "EMI"),
                                            "debt-value-green"
                                        )}
                                    </td>

                                    <td>
                                        {renderValueBadge(
                                            getPaymentTotal(debtPayments, "PART_PAYMENT") === "—"
                                                ? null
                                                : getPaymentTotal(debtPayments, "PART_PAYMENT"),
                                            "debt-value-teal"
                                        )}
                                    </td>

                                    <td>
                                        {renderValueBadge(
                                            getRecordedBreakdown(debtPayments, "principal_amount") === "—"
                                                ? null
                                                : getRecordedBreakdown(debtPayments, "principal_amount"),
                                            "debt-value-principal"
                                        )}
                                    </td>

                                    <td>
                                        {renderValueBadge(
                                            getRecordedBreakdown(debtPayments, "interest_amount") === "—"
                                                ? null
                                                : getRecordedBreakdown(debtPayments, "interest_amount"),
                                            "debt-value-interest"
                                        )}
                                    </td>

                                    <td>
                                        {renderValueBadge(
                                            getPaidAfterOutstanding(debtPayments) === "—"
                                                ? null
                                                : getPaidAfterOutstanding(debtPayments),
                                            "debt-value-red"
                                        )}
                                    </td>

                                    <td>
                                        <span
                                            className={`debt-status ${debt.status}`}
                                        >
                                            {debt.status || "active"}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="debt-table-actions">
                                            <button
                                                type="button"
                                                title="Record payment"
                                                onClick={() => onPayment?.(debt)}
                                            >
                                                Pay
                                            </button>

                                            <button
                                                type="button"
                                                title="Edit debt"
                                                onClick={() => onEdit?.(debt)}
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            <button
                                                type="button"
                                                title="Delete debt"
                                                onClick={() => onDelete?.(debt)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="15" className="empty-state">
                                No debts found. Add your first debt to get started.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
