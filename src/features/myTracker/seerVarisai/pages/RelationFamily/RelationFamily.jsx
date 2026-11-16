
import { useMemo, useState } from "react";
import { Plus, ArrowLeft, Users, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import {
    createFamily,
    updateFamily,
    deleteFamily,
    selectSeervarisaiSaving,
} from "../../seervarisaiSlice";

import "./RelationFamily.css";
import RelationFamilyCard from "../../components/RelationFamilyCard/RelationFamilyCard";
import FamilyFormModal from "../../components/FamilyFormModal/FamilyFormModal";

const formatCurrency = (amountMinor = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format((Number(amountMinor) || 0) / 100);

function RelationFamily({
    familyType,
    families = [],
    members = [],
    transactions = [],
    onBack,
    onSelectFamily,
}) {
    const dispatch = useDispatch();
    const saving = useSelector(selectSeervarisaiSaving);

    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingFamily, setEditingFamily] = useState(null);

    const familyList = useMemo(
        () =>
            families.filter(
                (family) => family.family_type === familyType
            ),
        [families, familyType]
    );

    const filteredFamilies = useMemo(
        () =>
            familyList.filter((family) =>
                family.family_name
                    .toLowerCase()
                    .includes(search.trim().toLowerCase())
            ),
        [familyList, search]
    );

    const openCreateModal = () => {
        setEditingFamily(null);
        setModalOpen(true);
    };

    const openEditModal = (family) => {
        setEditingFamily(family);
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;
        setModalOpen(false);
        setEditingFamily(null);
    };

    const handleSaveFamily = async (payload) => {
        try {
            if (editingFamily) {
                await dispatch(
                    updateFamily({
                        familyId: editingFamily.id,
                        familyData: payload,
                    })
                ).unwrap();
            } else {
                await dispatch(createFamily(payload)).unwrap();
            }

            setModalOpen(false);
            setEditingFamily(null);
        } catch (error) {
            window.alert(error || "Unable to save family.");
            throw error;
        }
    };

    const handleDeleteFamily = async (family) => {
        const confirmed = window.confirm(
            `Delete "${family.family_name}"?\n\nAll members and transactions belonging to this family will also be deleted. This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await dispatch(deleteFamily(family.id)).unwrap();
        } catch (error) {
            window.alert(error || "Unable to delete family.");
        }
    };

    const getFamilySummary = (family) => {
        const familyMembers = members.filter(
            (member) => member.family_id === family.id
        );

        const memberIds = new Set(
            familyMembers.map((member) => member.id)
        );

        const familyTransactions = transactions.filter(
            (transaction) => memberIds.has(transaction.member_id)
        );

        const relationsSpent = familyTransactions
            .filter(
                (transaction) =>
                    transaction.transaction_type === "RELATIONS_SPENT"
            )
            .reduce(
                (total, transaction) =>
                    total + Number(transaction.amount_minor || 0),
                Number(family.opening_relations_spent_minor || 0)
            );

        const iSpent = familyTransactions
            .filter(
                (transaction) =>
                    transaction.transaction_type === "I_SPENT"
            )
            .reduce(
                (total, transaction) =>
                    total + Number(transaction.amount_minor || 0),
                Number(family.opening_i_spent_minor || 0)
            );

        return {
            memberCount: familyMembers.length,
            transactionCount: familyTransactions.length,
            relationsSpent,
            iSpent,
        };
    };

    const totalRelationsSpent = familyList.reduce(
        (total, family) =>
            total + getFamilySummary(family).relationsSpent,
        0
    );

    const totalISpent = familyList.reduce(
        (total, family) =>
            total + getFamilySummary(family).iSpent,
        0
    );

    const totalMembers = familyList.reduce(
        (total, family) =>
            total + getFamilySummary(family).memberCount,
        0
    );

    return (
        <div className="relation-family-page">

            <div className="relation-family-page-top">
                <button
                    type="button"
                    className="relation-family-back"
                    onClick={onBack}
                >
                    <ArrowLeft size={17} />
                    Seervarisai
                </button>

                <div className="relation-family-page-heading">
                    <div>
                        <span className="relation-family-eyebrow">
                            SEERVARISAI
                        </span>

                        <h1>
                            {familyType === "SARATHKUMAR_RELATIONS"
                                ? "Sarathkumar Relations"
                                : "Kowsalya Relations"}
                        </h1>

                        <p>
                            Manage relation families, members and contributions.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="relation-family-create-button"
                        onClick={openCreateModal}
                    >
                        <Plus size={18} />
                        Create Relation Family
                    </button>
                </div>
            </div>

            <div className="relation-family-summary-grid">
                <div className="relation-family-summary-card blue">
                    <div className="relation-family-summary-icon">
                        <Users size={21} />
                    </div>
                    <span>Total Families</span>
                    <strong>{familyList.length}</strong>
                </div>

                <div className="relation-family-summary-card purple">
                    <div className="relation-family-summary-icon">
                        <Users size={21} />
                    </div>
                    <span>Total Members</span>
                    <strong>{totalMembers}</strong>
                </div>

                <div className="relation-family-summary-card green">
                    <div className="relation-family-summary-icon">
                        <Plus size={21} />
                    </div>
                    <span>Relations spent to me</span>
                    <strong>{formatCurrency(totalRelationsSpent)}</strong>
                </div>

                <div className="relation-family-summary-card orange">
                    <div className="relation-family-summary-icon">
                        <Plus size={21} />
                    </div>
                    <span>I spent to them</span>
                    <strong>{formatCurrency(totalISpent)}</strong>
                </div>
            </div>

            <div className="relation-family-list-heading">
                <div>
                    <h2>Relation Families</h2>
                    <p>
                        {familyList.length}{" "}
                        {familyList.length === 1 ? "family" : "families"} registered
                    </p>
                </div>

                <div className="relation-family-search">
                    <Search size={17} />
                    <input
                        type="search"
                        placeholder="Search family..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>
            </div>

            {filteredFamilies.length > 0 ? (
                <div className="relation-family-grid">
                    {filteredFamilies.map((family) => {
                        const summary = getFamilySummary(family);

                        return (
                            <RelationFamilyCard
                                key={family.id}
                                family={family}
                                {...summary}
                                onClick={() => onSelectFamily(family)}
                                onEdit={() => openEditModal(family)}
                                onDelete={() => handleDeleteFamily(family)}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="relation-family-empty">
                    <div className="relation-family-empty-icon">
                        <Users size={30} />
                    </div>

                    <h3>
                        {search
                            ? "No matching families"
                            : "No relation families yet"}
                    </h3>

                    <p>
                        {search
                            ? "Try a different family name."
                            : "Create your first relation family to start tracking contributions."}
                    </p>

                    {!search && (
                        <button
                            type="button"
                            onClick={openCreateModal}
                        >
                            <Plus size={17} />
                            Create Relation Family
                        </button>
                    )}
                </div>
            )}

            <FamilyFormModal
                isOpen={modalOpen}
                family={editingFamily}
                familyType={familyType}
                saving={saving}
                onClose={closeModal}
                onSubmit={handleSaveFamily}
            />
        </div>
    );
}

export default RelationFamily;
