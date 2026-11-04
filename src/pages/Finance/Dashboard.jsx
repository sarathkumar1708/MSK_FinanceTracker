import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTransactions } from "../../features/transactions/transactionSlice";

function Dashboard() {
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);

    const { items, loading, error } = useSelector(
        (state) => state.transactions
    );

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchTransactions());
        }
    }, [user?.id, dispatch]);

    if (loading) return <p>Loading transactions...</p>;

    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>My Transactions</h1>

            {items.map((transaction) => (
                <div key={transaction.id}>
                    {transaction.description}
                    {" - ₹"}
                    {(Number(transaction.amount_minor) / 100).toFixed(2)}
                </div>
            ))}
        </div>
    );
}

export default Dashboard;