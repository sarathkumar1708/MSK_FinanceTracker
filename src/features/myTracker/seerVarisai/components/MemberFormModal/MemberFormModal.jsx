
import { useEffect, useState } from "react";
import { X, UserRound } from "lucide-react";

import "./MemberFormModal.css";

const EMPTY_FORM = {
    member_name: "",
    relationship: "",
    remarks: "",
};

function MemberFormModal({
    isOpen,
    member,
    saving = false,
    onClose,
    onSubmit,
}) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        setForm(
            member
                ? {
                    member_name: member.member_name || "",
                    relationship: member.relationship || "",
                    remarks: member.remarks || "",
                }
                : EMPTY_FORM
        );

        setFormError("");
    }, [isOpen, member]);

    if (!isOpen) return null;

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setFormError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.member_name.trim()) {
            setFormError("Please enter the member name.");
            return;
        }

        try {
            await onSubmit({
                member_name: form.member_name.trim(),
                relationship: form.relationship.trim(),
                remarks: form.remarks.trim(),
            });
        } catch {
            // Parent handles the save error.
        }
    };

    return (
        <div
            className="member-modal-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) {
                    onClose();
                }
            }}
        >
            <div
                className="member-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="member-modal-title"
            >
                <div className="member-modal-header">
                    <div className="member-modal-icon">
                        <UserRound size={22} />
                    </div>

                    <div>
                        <h2 id="member-modal-title">
                            {member ? "Edit Member" : "Add Family Member"}
                        </h2>
                        <p>
                            Add the details of your family member.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="member-modal-close"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="member-modal-body">
                        <div className="member-form-field">
                            <label htmlFor="member_name">
                                Member Name *
                            </label>

                            <input
                                id="member_name"
                                name="member_name"
                                type="text"
                                value={form.member_name}
                                onChange={handleChange}
                                placeholder="e.g. Arun Kumar"
                                maxLength={100}
                                autoFocus
                                required
                            />
                        </div>

                        <div className="member-form-field">
                            <label htmlFor="relationship">
                                Relationship
                            </label>

                            <select
                                id="relationship"
                                name="relationship"
                                value={form.relationship}
                                onChange={handleChange}
                            >
                                <option value="">Select relationship</option>
                                <option value="Son">Son</option>
                                <option value="Daughter">Daughter</option>
                                <option value="Father">Father</option>
                                <option value="Mother">Mother</option>
                                <option value="Brother">Brother</option>
                                <option value="Sister">Sister</option>
                                <option value="Uncle">Uncle</option>
                                <option value="Aunt">Aunt</option>
                                <option value="Cousin">Cousin</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="member-form-field">
                            <label htmlFor="remarks">Remarks</label>

                            <textarea
                                id="remarks"
                                name="remarks"
                                value={form.remarks}
                                onChange={handleChange}
                                placeholder="Optional notes..."
                                rows={3}
                                maxLength={500}
                            />
                        </div>

                        {formError && (
                            <div className="member-form-error">
                                {formError}
                            </div>
                        )}
                    </div>

                    <div className="member-modal-footer">
                        <button
                            type="button"
                            className="member-cancel-button"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="member-save-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : member
                                    ? "Update Member"
                                    : "Create Member"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default MemberFormModal;
