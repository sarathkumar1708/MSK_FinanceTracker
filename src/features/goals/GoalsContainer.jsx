
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
} from "./goalSlice";
import Goals from "./pages/Goals";



export default function GoalsContainer() {
    const dispatch = useDispatch();

    const {
        goals,
        loading,
        saving,
        error,
    } = useSelector((state) => state.goals);

    useEffect(() => {
        dispatch(fetchGoals());
    }, [dispatch]);

    const handleCreateGoal = async (goalData) => {
        await dispatch(createGoal(goalData)).unwrap();
    };

    const handleUpdateGoal = async (payload) => {
        await dispatch(updateGoal(payload)).unwrap();
    };

    const handleDeleteGoal = async (id) => {
        await dispatch(deleteGoal(id)).unwrap();
    };

    return (
        <Goals
            goals={goals}
            loading={loading}
            saving={saving}
            error={error}
            onCreateGoal={handleCreateGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
        />
    );
}
