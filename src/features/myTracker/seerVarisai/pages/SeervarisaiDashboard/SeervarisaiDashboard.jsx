
import {
    Users,
    HeartHandshake,
    ArrowRight,
    Wallet,
    TrendingUp,
    UserRound,
} from "lucide-react";

import "./SeervarisaiDashboard.css";

const FAMILY_TYPES = [
    {
        type: "SARATHKUMAR_RELATIONS",
        title: "Sarathkumar Relations",
        subtitle: "Your family relations",
        description: "Manage your family members and Seervarisai contributions.",
        icon: Users,
        className: "sarath",
    },
    {
        type: "KOWSALYA_RELATIONS",
        title: "Kowsalya Relations",
        subtitle: "Wife's family relations",
        description: "Manage your wife's family members and contributions.",
        icon: HeartHandshake,
        className: "kowsalya",
    },
];

const formatCurrency = (amountMinor = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format((Number(amountMinor) || 0) / 100);

function SeervarisaiDashboard({
    families = [],
    members = [],
    transactions = [],
    onSelectFamilyType,
}) {
    const getFamilySummary = (familyType) => {
        const familyList = families.filter(
            (family) => family.family_type === familyType
        );

        const familyIds = new Set(familyList.map((family) => family.id));

        const memberList = members.filter(
            (member) => familyIds.has(member.family_id)
        );

        const memberIds = new Set(memberList.map((member) => member.id));

        const transactionList = transactions.filter(
            (transaction) => memberIds.has(transaction.member_id)
        );

        const openingRelationsSpent = familyList.reduce(
            (total, family) =>
                total + Number(family.opening_relations_spent_minor || 0),
            0
        );

        const openingISpent = familyList.reduce(
            (total, family) =>
                total + Number(family.opening_i_spent_minor || 0),
            0
        );

        const relationsTransactions = transactionList
            .filter((item) => item.transaction_type === "RELATIONS_SPENT")
            .reduce((total, item) => total + Number(item.amount_minor || 0), 0);

        const myTransactions = transactionList
            .filter((item) => item.transaction_type === "I_SPENT")
            .reduce((total, item) => total + Number(item.amount_minor || 0), 0);

        return {
            familyCount: familyList.length,
            memberCount: memberList.length,
            relationsSpent: openingRelationsSpent + relationsTransactions,
            iSpent: openingISpent + myTransactions,
        };
    };

    return (
        <div className="seervarisai-dashboard">

            <div className="seervarisai-page-heading">
                <div>
                    <span className="seervarisai-eyebrow">
                        MY TRACKER
                    </span>

                    <h1>Seervarisai Tracker</h1>

                    <p>
                        Track family functions, contributions and expenses
                        in one place.
                    </p>
                </div>

                <div className="seervarisai-heading-icon">
                    <Wallet size={30} />
                </div>
            </div>

            <div className="seervarisai-section-heading">
                <div>
                    <h2>Select Family Relations</h2>
                    <p>
                        Choose whose family relations you want to manage.
                    </p>
                </div>
            </div>

            <div className="seervarisai-family-type-grid">

                {FAMILY_TYPES.map((familyType) => {
                    const summary = getFamilySummary(familyType.type);
                    const Icon = familyType.icon;

                    return (
                        <button
                            type="button"
                            key={familyType.type}
                            className={`seervarisai-family-type-card ${familyType.className}`}
                            onClick={() =>
                                onSelectFamilyType(familyType.type)
                            }
                        >
                            <div className="seervarisai-family-card-top">
                                <div className="seervarisai-family-type-icon">
                                    <Icon size={28} />
                                </div>

                                <span className="seervarisai-family-card-arrow">
                                    <ArrowRight size={20} />
                                </span>
                            </div>

                            <div className="seervarisai-family-card-title">
                                <span>{familyType.subtitle}</span>
                                <h3>{familyType.title}</h3>
                                <p>{familyType.description}</p>
                            </div>

                            <div className="seervarisai-family-card-stats">

                                <div className="seervarisai-family-count">
                                    <Users size={17} />
                                    <div>
                                        <strong>{summary.familyCount}</strong>
                                        <span>Families</span>
                                    </div>
                                </div>

                                <div className="seervarisai-family-count">
                                    <UserRound size={17} />
                                    <div>
                                        <strong>{summary.memberCount}</strong>
                                        <span>Members</span>
                                    </div>
                                </div>

                            </div>

                            <div className="seervarisai-family-card-finances">

                                <div>
                                    <span>
                                        <TrendingUp size={14} />
                                        Relations spent to me
                                    </span>

                                    <strong>
                                        {formatCurrency(summary.relationsSpent)}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        <Wallet size={14} />
                                        I spent to them
                                    </span>

                                    <strong>
                                        {formatCurrency(summary.iSpent)}
                                    </strong>
                                </div>

                            </div>

                            <div className="seervarisai-family-card-footer">
                                <span>View family details</span>
                                <ArrowRight size={17} />
                            </div>
                        </button>
                    );
                })}

            </div>
        </div>
    );
}

export default SeervarisaiDashboard;
