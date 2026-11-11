
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import BudgetPlanner from "./BudgetPlanner";
import { fetchBudgetYear } from "../../budgetSlice";

export default function BudgetPlannerContainer() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        months,
        incomes,
        budgetItems,
        loading,
        error,
    } = useSelector((state) => state.budget);

    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        dispatch(fetchBudgetYear(year));
    }, [dispatch, year]);

    const handleYearChange = (direction) => {
        setYear((currentYear) => currentYear + direction);
    };

    const handleOpenMonth = (month) => {
        navigate(`/planner/budget/${year}/${month}`);
    };

    return (
        <BudgetPlanner
            year={year}
            onChangeYear={handleYearChange}
            months={months}
            incomes={incomes}
            budgetItems={budgetItems}
            loading={loading}
            error={error}
            onOpenMonth={handleOpenMonth}
        />
    );
}
