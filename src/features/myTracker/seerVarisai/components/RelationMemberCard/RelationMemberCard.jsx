
import {
    UserRound,
    Pencil,
    Trash2,
    ArrowRight,
    TrendingUp,
    Wallet,
    Receipt,
} from "lucide-react";

import "./RelationMemberCard.css";

const formatCurrency = (amountMinor = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format((Number(amountMinor) || 0) / 100);

function RelationMemberCard({
    member,
    relationsSpent = 0,
    iSpent = 0,
    transactionCount = 0,
    onClick,
    onEdit,
    onDelete,
}) {
    return (
        <article className="relation-member-card">
            <div className="relation-member-card-header">
                <div className="relation-member-avatar">
                    <UserRound size={25} />
                </div>

                <div className="relation-member-actions">
                    <button
                        type="button"
                        title="Edit member"
                        onClick={(event) => {
                            event.stopPropagation();
                            onEdit();
                        }}
                    >
                        <Pencil size={15} />
                    </button>

                    <button
                        type="button"
                        title="Delete member"
                        className="delete"
                        onClick={(event) => {
                            event.stopPropagation();
                            onDelete();
                        }}
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            <button
                type="button"
                className="relation-member-card-main"
                onClick={onClick}
            >
                <h3>{member.member_name}</h3>

                <p>{member.relationship || "Family Member"}</p>

                <div className="relation-member-transaction-count">
                    <Receipt size={15} />
                    <span>{transactionCount} Transactions</span>
                </div>

                <div className="relation-member-totals">
                    <div className="relation-member-total received">
                        <span>
                            <TrendingUp size={14} />
                            Relations spent to me
                        </span>
                        <strong>{formatCurrency(relationsSpent)}</strong>
                    </div>

                    <div className="relation-member-total given">
                        <span>
                            <Wallet size={14} />
                            I spent to them
                        </span>
                        <strong>{formatCurrency(iSpent)}</strong>
                    </div>
                </div>

                <div className="relation-member-card-footer">
                    <span>View transactions</span>
                    <ArrowRight size={17} />
                </div>
            </button>
        </article>
    );
}

export default RelationMemberCard;
