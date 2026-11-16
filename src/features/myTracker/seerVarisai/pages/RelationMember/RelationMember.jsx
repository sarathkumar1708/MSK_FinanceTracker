
import { useMemo, useState } from "react";
import {
    Plus,
    ArrowLeft,
    Users,
    Search,
    UserRound,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";



import {
    createMember,
    updateMember,
    deleteMember,
    selectSeervarisaiSaving,
} from "../../seervarisaiSlice";

import "./RelationMember.css";
import RelationMemberCard from "../../components/RelationMemberCard/RelationMemberCard";
import MemberFormModal from "../../components/MemberFormModal/MemberFormModal";

const formatCurrency = (amountMinor = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format((Number(amountMinor) || 0) / 100);

function RelationMember({
    family,
    members = [],
    transactions = [],
    onBack,
    onSelectMember,
}) {
    const dispatch = useDispatch();
    const saving = useSelector(selectSeervarisaiSaving);

    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);

    const familyMembers = useMemo(
        () =>
            members.filter(
                (member) => member.family_id === family.id
            ),
        [members, family.id]
    );

    const filteredMembers = useMemo(
        () =>
            familyMembers.filter((member) =>
                member.member_name
                    .toLowerCase()
                    .includes(search.trim().toLowerCase())
            ),
        [familyMembers, search]
    );

    const getMemberSummary = (member) => {
        const memberTransactions = transactions.filter(
            (transaction) => transaction.member_id === member.id
        );

        const relationsSpent = memberTransactions
            .filter(
                (transaction) =>
                    transaction.transaction_type === "RELATIONS_SPENT"
            )
            .reduce(
                (total, transaction) =>
                    total + Number(transaction.amount_minor || 0),
                0
            );

        const iSpent = memberTransactions
            .filter(
                (transaction) =>
                    transaction.transaction_type === "I_SPENT"
            )
            .reduce(
                (total, transaction) =>
                    total + Number(transaction.amount_minor || 0),
                0
            );

        return {
            relationsSpent,
            iSpent,
            transactionCount: memberTransactions.length,
        };
    };

    const familyTotals = familyMembers.reduce(
        (totals, member) => {
            const summary = getMemberSummary(member);

            totals.relationsSpent += summary.relationsSpent;
            totals.iSpent += summary.iSpent;
            totals.transactionCount += summary.transactionCount;

            return totals;
        },
        {
            relationsSpent: 0,
            iSpent: 0,
            transactionCount: 0,
        }
    );

    const totalRelationsSpent =
        Number(family.opening_relations_spent_minor || 0) +
        familyTotals.relationsSpent;

    const totalISpent =
        Number(family.opening_i_spent_minor || 0) +
        familyTotals.iSpent;

    const openCreateModal = () => {
        setEditingMember(null);
        setModalOpen(true);
    };

    const openEditModal = (member) => {
        setEditingMember(member);
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;
        setModalOpen(false);
        setEditingMember(null);
    };

    const handleSaveMember = async (payload) => {
        try {
            if (editingMember) {
                await dispatch(
                    updateMember({
                        memberId: editingMember.id,
                        memberData: payload,
                    })
                ).unwrap();
            } else {
                await dispatch(
                    createMember({
                        ...payload,
                        family_id: family.id,
                    })
                ).unwrap();
            }

            setModalOpen(false);
            setEditingMember(null);
        } catch (error) {
            window.alert(error || "Unable to save member.");
            throw error;
        }
    };

    const handleDeleteMember = async (member) => {
        const confirmed = window.confirm(
            `Delete "${member.member_name}"?\n\nAll transactions belonging to this member will also be deleted. This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await dispatch(deleteMember(member.id)).unwrap();
        } catch (error) {
            window.alert(error || "Unable to delete member.");
        }
    };

    return (
        <div className="relation-member-page">

            <div className="relation-member-page-top">
                <button
                    type="button"
                    className="relation-member-back"
                    onClick={onBack}
                >
                    <ArrowLeft size={17} />
                    Back to Families
                </button>

                <div className="relation-member-heading">
                    <div>
                        <span className="relation-member-eyebrow">
                            RELATION FAMILY
                        </span>

                        <h1>{family.family_name}</h1>

                        <p>
                            Manage sons, daughters and other family members.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="relation-member-create-button"
                        onClick={openCreateModal}
                    >
                        <Plus size={18} />
                        Add Member
                    </button>
                </div>
            </div>

            <div className="relation-member-summary-grid">
                <div className="relation-member-summary-card purple">
                    <div className="relation-member-summary-icon">
                        <Users size={21} />
                    </div>
                    <span>Total Members</span>
                    <strong>{familyMembers.length}</strong>
                </div>

                <div className="relation-member-summary-card blue">
                    <div className="relation-member-summary-icon">
                        <UserRound size={21} />
                    </div>
                    <span>Total Transactions</span>
                    <strong>{familyTotals.transactionCount}</strong>
                </div>

                <div className="relation-member-summary-card green">
                    <div className="relation-member-summary-icon">
                        <Plus size={21} />
                    </div>
                    <span>Relations spent to me</span>
                    <strong>{formatCurrency(totalRelationsSpent)}</strong>
                </div>

                <div className="relation-member-summary-card orange">
                    <div className="relation-member-summary-icon">
                        <Plus size={21} />
                    </div>
                    <span>I spent to them</span>
                    <strong>{formatCurrency(totalISpent)}</strong>
                </div>
            </div>

            <div className="relation-member-list-heading">
                <div>
                    <h2>Family Members</h2>
                    <p>
                        {familyMembers.length}{" "}
                        {familyMembers.length === 1 ? "member" : "members"} registered
                    </p>
                </div>

                <div className="relation-member-search">
                    <Search size={17} />
                    <input
                        type="search"
                        placeholder="Search member..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>
            </div>

            {filteredMembers.length > 0 ? (
                <div className="relation-member-grid">
                    {filteredMembers.map((member) => (
                        <RelationMemberCard
                            key={member.id}
                            member={member}
                            {...getMemberSummary(member)}
                            onClick={() => onSelectMember(member)}
                            onEdit={() => openEditModal(member)}
                            onDelete={() => handleDeleteMember(member)}
                        />
                    ))}
                </div>
            ) : (
                <div className="relation-member-empty">
                    <div className="relation-member-empty-icon">
                        <Users size={30} />
                    </div>

                    <h3>
                        {search
                            ? "No matching members"
                            : "No family members yet"}
                    </h3>

                    <p>
                        {search
                            ? "Try searching with another name."
                            : "Add your first son or daughter to start tracking their transactions."}
                    </p>

                    {!search && (
                        <button
                            type="button"
                            onClick={openCreateModal}
                        >
                            <Plus size={17} />
                            Add Member
                        </button>
                    )}
                </div>
            )}

            <MemberFormModal
                isOpen={modalOpen}
                member={editingMember}
                saving={saving}
                onClose={closeModal}
                onSubmit={handleSaveMember}
            />
        </div>
    );
}

export default RelationMember;
