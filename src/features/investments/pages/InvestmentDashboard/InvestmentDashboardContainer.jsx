
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchInvestmentData } from "../../investmentSlice";
import InvestmentDashboard from "./InvestmentDashboard";

export default function InvestmentDashboardContainer() {
    const dispatch = useDispatch();

    const {
        investments = [],
        transactions = [],
        monthlySnapshots = [],
        loading = false,
    } = useSelector((state) => state.investment);

    useEffect(() => {
        dispatch(fetchInvestmentData());
    }, [dispatch]);

    return (
        <InvestmentDashboard
            investments={investments}
            transactions={transactions}
            monthlySnapshots={monthlySnapshots}
            loading={loading}
        />
    );
}
