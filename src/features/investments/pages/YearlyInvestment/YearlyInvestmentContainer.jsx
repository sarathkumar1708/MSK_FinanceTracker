
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchInvestmentData } from "../../investmentSlice";
import YearlyInvestment from "./YearlyInvestment";

export default function YearlyInvestmentContainer() {
    const dispatch = useDispatch();

    const {
        investments,
        transactions,
        monthlySnapshots,
        loading,
    } = useSelector((state) => state.investment);

    useEffect(() => {
        dispatch(fetchInvestmentData());
    }, [dispatch]);

    return (
        <YearlyInvestment
            investments={investments}
            transactions={transactions}
            monthlySnapshots={monthlySnapshots}
            loading={loading}
        />
    );
}
