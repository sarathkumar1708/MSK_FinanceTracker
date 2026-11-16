
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";

import SeervarisaiDashboard from "./pages/SeervarisaiDashboard/SeervarisaiDashboard";
import RelationFamily from "./pages/RelationFamily/RelationFamily";
import RelationMember from "./pages/RelationMember/RelationMember";
import RelationMemberDetail from "./pages/RelationMember/RelationMemberDetail";

import {
    fetchSeervarisaiData,
    selectSeervarisaiFamilies,
    selectSeervarisaiMembers,
    selectSeervarisaiTransactions,
    selectSeervarisaiLoading,
    selectSeervarisaiError,
} from "./seervarisaiSlice";

import "./pages/SeervarisaiDashboard/SeervarisaiDashboard.css";

function SeervarisaiContainer() {
    const dispatch = useDispatch();

    const families = useSelector(selectSeervarisaiFamilies);
    const members = useSelector(selectSeervarisaiMembers);
    const transactions = useSelector(selectSeervarisaiTransactions);
    const loading = useSelector(selectSeervarisaiLoading);
    const error = useSelector(selectSeervarisaiError);

    const [selectedFamilyType, setSelectedFamilyType] = useState(null);
    const [selectedFamily, setSelectedFamily] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);

    useEffect(() => {
        dispatch(fetchSeervarisaiData());
    }, [dispatch]);

    const handleBackToDashboard = () => {
        setSelectedMember(null);
        setSelectedFamily(null);
        setSelectedFamilyType(null);
    };

    const handleBackToFamilies = () => {
        setSelectedMember(null);
        setSelectedFamily(null);
    };

    const handleBackToMembers = () => {
        setSelectedMember(null);
    };

    if (loading && !families.length && !members.length) {
        return (
            <div className="seervarisai-loading">
                Loading Seervarisai data...
            </div>
        );
    }

    if (error && !families.length && !members.length) {
        return (
            <div className="seervarisai-error">
                <p>{error}</p>
                <button
                    type="button"
                    onClick={() => dispatch(fetchSeervarisaiData())}
                >
                    Try Again
                </button>
            </div>
        );
    }
    
    if (selectedMember && selectedFamily) {
        return (
            <RelationMemberDetail
                member={selectedMember}
                transactions={transactions}
                onBack={handleBackToMembers}
            />
        );
    }

    if (selectedFamily) {
        return (
            <RelationMember
                family={selectedFamily}
                members={members}
                transactions={transactions}
                onBack={handleBackToFamilies}
                onSelectMember={setSelectedMember}
            />
        );
    }

    if (selectedFamilyType) {
        return (
            <RelationFamily
                familyType={selectedFamilyType}
                families={families}
                members={members}
                transactions={transactions}
                onBack={handleBackToDashboard}
                onSelectFamily={setSelectedFamily}
            />
        );
    }

    return (
        <SeervarisaiDashboard
            families={families}
            members={members}
            transactions={transactions}
            onSelectFamilyType={setSelectedFamilyType}
        />
    );
}

export default SeervarisaiContainer;
