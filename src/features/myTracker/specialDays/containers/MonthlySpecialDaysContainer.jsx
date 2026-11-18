
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import MonthlySpecialDays from "../pages/MonthlySpecialDays/MonthlySpecialDays";

import {
    fetchSpecialDays,
    createSpecialDay,
    updateSpecialDay,
    deleteSpecialDay,
} from "../store/specialDaysSlice";

const MONTH_NAMES = [
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

function getErrorMessage(error) {
    if (typeof error === "string" && error.trim()) return error;

    return (
        error?.message ||
        error?.payload ||
        "Something went wrong. Please try again."
    );
}

function MonthlySpecialDaysContainer() {
    const { month: monthParam } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        specialDays = [],
        loading,
        saving,
        error,
    } = useSelector((state) => state.specialDays || {});

    const [modalOpen, setModalOpen] = useState(false);
    const [editingSpecialDay, setEditingSpecialDay] = useState(null);
    const [actionError, setActionError] = useState("");

    const monthNumber = Number(monthParam);

    const validMonth =
        Number.isInteger(monthNumber) &&
        monthNumber >= 1 &&
        monthNumber <= 12;

    const monthName = validMonth
        ? MONTH_NAMES[monthNumber - 1]
        : "Invalid Month";

    useEffect(() => {
        if (validMonth) {
            dispatch(fetchSpecialDays());
        }
    }, [dispatch, validMonth]);

    const monthlyEvents = useMemo(() => {
        if (!validMonth) return [];

        return specialDays
            .filter((event) => {
                const [, month] = String(event.event_date || "")
                    .split("-")
                    .map(Number);

                return month === monthNumber;
            })
            .sort((a, b) => {
                const dayA = Number(a.event_date.split("-")[2]);
                const dayB = Number(b.event_date.split("-")[2]);

                return dayA - dayB;
            });
    }, [specialDays, monthNumber, validMonth]);

    const todayEvents = useMemo(() => {
        const today = new Date();

        return monthlyEvents.filter((event) => {
            const [, month, day] = event.event_date
                .split("-")
                .map(Number);

            return (
                month === today.getMonth() + 1 &&
                day === today.getDate()
            );
        });
    }, [monthlyEvents]);

    const openCreateModal = () => {
        setActionError("");
        setEditingSpecialDay(null);
        setModalOpen(true);
    };

    const openEditModal = (event) => {
        setActionError("");
        setEditingSpecialDay(event);
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;

        setModalOpen(false);
        setEditingSpecialDay(null);
        setActionError("");
    };

    const handleSave = async (formData) => {
        try {
            setActionError("");

            if (editingSpecialDay) {
                await dispatch(
                    updateSpecialDay({
                        id: editingSpecialDay.id,
                        ...formData,
                    })
                ).unwrap();
            } else {
                await dispatch(
                    createSpecialDay(formData)
                ).unwrap();
            }

            setModalOpen(false);
            setEditingSpecialDay(null);
        } catch (err) {
            const message = getErrorMessage(err);
            setActionError(message);
            throw err;
        }
    };

    const handleDelete = async (event) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${event.title}"?`
        );

        if (!confirmed) return;

        try {
            setActionError("");

            await dispatch(
                deleteSpecialDay(event.id)
            ).unwrap();
        } catch (err) {
            setActionError(getErrorMessage(err));
        }
    };

    const handleBack = () => {
        navigate("/my-tracker/special-days");
    };

    if (!validMonth) {
        return (
            <div className="special-days-error">
                Invalid month selected.
                <button onClick={handleBack}>
                    Back to Special Days
                </button>
            </div>
        );
    }

    return (
        <MonthlySpecialDays
            monthNumber={monthNumber}
            monthName={monthName}
            events={monthlyEvents}
            totalCount={monthlyEvents.length}
            todayCount={todayEvents.length}
            loading={loading}
            saving={saving}
            error={actionError || error}
            modalOpen={modalOpen}
            editingSpecialDay={editingSpecialDay}
            onBack={handleBack}
            onCreate={openCreateModal}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onCloseModal={closeModal}
            onSave={handleSave}
        />
    );
}

export default MonthlySpecialDaysContainer;
