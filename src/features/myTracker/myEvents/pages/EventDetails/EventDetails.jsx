
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    ArrowLeft,
    CalendarDays,
    Wallet,
    Gem,
    Shirt,
    Gift,
    Plus,
} from "lucide-react";

import {
    fetchEventTransactions,
    createEventTransaction,
    updateEventTransaction,
    deleteEventTransaction,
    selectMyEventTransactions,
    selectMyEventsLoading,
    selectMyEventsSaving,
    clearMyEventsError,
} from "../../myEventsSlice";

import EventTransactionModal from "../../components/EventTransactionModal/EventTransactionModal";
import EventTransactionTable from "../../components/EventTransactionTable/EventTransactionTable";

import "./EventDetails.css";

const formatCurrency = (minor = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(minor || 0) / 100);

const formatGold = (grams = 0) => {
    const value = Number(grams || 0);
    const savaran = Math.floor(value / 8);
    const remaining = Number((value % 8).toFixed(3));

    if (savaran > 0 && remaining > 0) {
        return `${savaran} Savaran ${remaining} g`;
    }

    if (savaran > 0) return `${savaran} Savaran`;

    return `${remaining} g`;
};

const SummaryCard = ({ icon: Icon, label, value, color }) => (
    <div className="my-event-detail-summary-card">
        <div className={`my-event-detail-summary-icon ${color}`}>
            <Icon size={21} />
        </div>
        <div>
            <p>{label}</p>
            <h3>{value}</h3>
        </div>
    </div>
);

const EventDetails = ({ event, instance, onBack }) => {
    const dispatch = useDispatch();

    const transactions = useSelector(selectMyEventTransactions);
    const loading = useSelector(selectMyEventsLoading);
    const saving = useSelector(selectMyEventsSaving);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    useEffect(() => {
        if (instance?.id) {
            dispatch(fetchEventTransactions(instance.id));
        }
    }, [dispatch, instance?.id]);

    const summary = useMemo(() => {
        const result = {
            cash: 0,
            gold: 0,
            dress: 0,
            thattuvarisai: 0,
        };

        transactions.forEach((transaction) => {
            (transaction.my_event_offerings || []).forEach((offering) => {
                switch (offering.offering_type) {
                    case "CASH":
                        result.cash += Number(offering.amount_minor || 0);
                        break;

                    case "GOLD":
                        result.gold += Number(offering.gold_grams || 0);
                        break;

                    case "DRESS":
                        result.dress += Number(offering.item_count || 0);
                        break;

                    case "THATTUVARISAI":
                        result.thattuvarisai += Number(
                            offering.item_count || 0
                        );
                        break;

                    default:
                        break;
                }
            });
        });

        return result;
    }, [transactions]);

    const handleAdd = () => {
        setEditingTransaction(null);
        dispatch(clearMyEventsError());
        setIsModalOpen(true);
    };

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        dispatch(clearMyEventsError());
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (saving) return;

        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const handleSubmit = async (formData) => {
        try {
            if (editingTransaction) {
                await dispatch(
                    updateEventTransaction({
                        transactionId: editingTransaction.id,
                        transactionData: {
                            ...formData,
                            offerings: formData.offerings,
                        },
                    })
                ).unwrap();
            } else {
                await dispatch(
                    createEventTransaction({
                        ...formData,
                        event_instance_id: instance.id,
                    })
                ).unwrap();
            }

            setIsModalOpen(false);
            setEditingTransaction(null);
        } catch (error) {
            window.alert(
                typeof error === "string"
                    ? error
                    : error?.message || "Unable to save transaction."
            );
        }
    };

    const handleDelete = async (transaction) => {
        const confirmed = window.confirm(
            `Delete the transaction recorded for ${transaction.person_name || "this person"}?`
        );

        if (!confirmed) return;

        try {
            await dispatch(
                deleteEventTransaction(transaction.id)
            ).unwrap();
        } catch (error) {
            window.alert(
                typeof error === "string"
                    ? error
                    : error?.message || "Unable to delete transaction."
            );
        }
    };

    return (
        <div className="my-event-details-page">
            <div className="my-event-details-header">
                <button
                    type="button"
                    className="my-event-back-btn"
                    onClick={onBack}
                >
                    <ArrowLeft size={18} />
                    Back to Events
                </button>

                <button
                    type="button"
                    className="my-event-add-transaction-btn"
                    onClick={handleAdd}
                >
                    <Plus size={18} />
                    Add Transaction
                </button>
            </div>

            <div className="my-event-details-title">
                <div className="my-event-details-title-icon">
                    <CalendarDays size={26} />
                </div>

                <div>
                    <h1>{instance?.event_title}</h1>
                    <p>
                        {event?.event_title}
                        {instance?.celebrated_person
                            ? ` • ${instance.celebrated_person}`
                            : ""}
                    </p>
                </div>
            </div>

            <div className="my-event-details-meta">
                <span>
                    <CalendarDays size={15} />
                    {instance?.event_date
                        ? new Date(`${instance.event_date}T00:00:00`)
                            .toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })
                        : "Date not specified"}
                </span>

                {instance?.remarks && <span>{instance.remarks}</span>}
            </div>

            <div className="my-event-detail-summary-grid">
                <SummaryCard
                    icon={Wallet}
                    label="Total Cash"
                    value={formatCurrency(summary.cash)}
                    color="cash"
                />

                <SummaryCard
                    icon={Gem}
                    label="Total Gold"
                    value={`${summary.gold} Grams`}
                    color="gold"
                />

                <SummaryCard
                    icon={Shirt}
                    label="Total Dresses"
                    value={`${summary.dress} Items`}
                    color="dress"
                />

                <SummaryCard
                    icon={Gift}
                    label="Thattuvarisai"
                    value={`${summary.thattuvarisai} Items`}
                    color="gift"
                />
            </div>

            <div className="my-event-transaction-section">
                <div className="my-event-transaction-heading">
                    <div>
                        <h2>Transaction History</h2>
                        <p>
                            Gifts and contributions received for this event.
                        </p>
                    </div>

                    <span className="my-event-transaction-count">
                        {transactions.length} Transactions
                    </span>
                </div>

                {loading ? (
                    <div className="my-event-details-status">
                        Loading transactions...
                    </div>
                ) : (
                    <EventTransactionTable
                        transactions={transactions}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            <EventTransactionModal
                isOpen={isModalOpen}
                transaction={editingTransaction}
                saving={saving}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default EventDetails;
