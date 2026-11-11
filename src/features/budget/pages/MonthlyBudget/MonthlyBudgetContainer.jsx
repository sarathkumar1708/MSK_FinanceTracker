
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    fetchBudgetMonth,
    fetchBudgetCategories,
    createBudgetIncome,
    updateBudgetIncome,
    deleteBudgetIncome,
    createBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
} from "../../budgetSlice";

import MonthlyBudget from "./MonthlyBudget";

export default function MonthlyBudgetContainer() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { year, month } = useParams();

    const selectedYear = Number(year);
    const selectedMonthNumber = Number(month);

    const {
        selectedMonth,
        incomes = [],
        budgetItems = [],
        categories = [],
        monthLoading,
        categoriesLoading,
        saving,
        error,
    } = useSelector((state) => state.budget);

    useEffect(() => {
        if (
            !Number.isInteger(selectedYear) ||
            !Number.isInteger(selectedMonthNumber) ||
            selectedMonthNumber < 1 ||
            selectedMonthNumber > 12
        ) {
            navigate("/planner/budget", { replace: true });
            return;
        }

        dispatch(
            fetchBudgetMonth({
                year: selectedYear,
                month: selectedMonthNumber,
            })
        );
    }, [dispatch, selectedYear, selectedMonthNumber, navigate]);

    useEffect(() => {
        dispatch(fetchBudgetCategories());
    }, [dispatch]);

    const handleBack = useCallback(() => {
        navigate("/planner/budget");
    }, [navigate]);

    const handleCreateIncome = (payload) =>
        dispatch(createBudgetIncome(payload)).unwrap();

    const handleUpdateIncome = (id, updates) =>
        dispatch(updateBudgetIncome({ id, updates })).unwrap();

    const handleDeleteIncome = (id) =>
        dispatch(deleteBudgetIncome(id)).unwrap();

    const handleCreateBudget = (payload) =>
        dispatch(createBudgetItem(payload)).unwrap();

    const handleUpdateBudget = (id, updates) =>
        dispatch(updateBudgetItem({ id, updates })).unwrap();

    const handleDeleteBudget = (id) =>
        dispatch(deleteBudgetItem(id)).unwrap();

    return (
        <MonthlyBudget
            year={selectedYear}
            month={selectedMonthNumber}
            selectedMonth={selectedMonth}
            incomes={incomes}
            budgetItems={budgetItems}
            categories={categories}
            loading={monthLoading}
            categoriesLoading={categoriesLoading}
            saving={saving}
            error={error}
            onBack={handleBack}
            onCreateIncome={handleCreateIncome}
            onUpdateIncome={handleUpdateIncome}
            onDeleteIncome={handleDeleteIncome}
            onCreateBudget={handleCreateBudget}
            onUpdateBudget={handleUpdateBudget}
            onDeleteBudget={handleDeleteBudget}
        />
    );
}
