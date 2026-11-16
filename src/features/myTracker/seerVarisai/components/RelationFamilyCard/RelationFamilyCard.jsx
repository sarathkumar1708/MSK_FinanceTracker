
import {
    Users,
    Receipt,
    Pencil,
    Trash2,
    ArrowRight,
    TrendingUp,
    Wallet,
} from "lucide-react";

import "./RelationFamilyCard.css";

const formatCurrency = (amountMinor = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format((Number(amountMinor) || 0) / 100);

function RelationFamilyCard({
    family,
    memberCount = 0,
    transactionCount = 0,
    relationsSpent = 0,
    iSpent = 0,
    onClick,
    onEdit,
    onDelete,
}) {
    return (
        <article className="relation-family-card">
            <div className="relation-family-card-header">
                <div className="relation-family-card-icon">
                    <Users size={24} />
                </div>

                <div className="relation-family-card-actions">
                    <button
                        type="button"
                        title="Edit family"
                        onClick={(event) => {
                            event.stopPropagation();
                            onEdit();
                        }}
                    >
                        <Pencil size={16} />
                    </button>

                    <button
                        type="button"
                        title="Delete family"
                        className="delete"
                        onClick={(event) => {
                            event.stopPropagation();
                            onDelete();
                        }}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <button
                type="button"
                className="relation-family-card-main"
                onClick={onClick}
            >
                <h3>{family.family_name}</h3>
                <p>Manage family members and transactions</p>

                <div className="relation-family-card-counts">
                    <div>
                        <Users size={16} />
                        <strong>{memberCount}</strong>
                        <span>Members</span>
                    </div>

                    <div>
                        <Receipt size={16} />
                        <strong>{transactionCount}</strong>
                        <span>Transactions</span>
                    </div>
                </div>

                <div className="relation-family-card-totals">
                    <div className="relation-family-total received">
                        <span>
                            <TrendingUp size={14} />
                            Relations spent to me
                        </span>
                        <strong>{formatCurrency(relationsSpent)}</strong>
                    </div>

                    <div className="relation-family-total given">
                        <span>
                            <Wallet size={14} />
                            I spent to them
                        </span>
                        <strong>{formatCurrency(iSpent)}</strong>
                    </div>
                </div>

                <div className="relation-family-card-footer">
                    <span>View members</span>
                    <ArrowRight size={17} />
                </div>
            </button>
        </article>
    );
}

export default RelationFamilyCard;
