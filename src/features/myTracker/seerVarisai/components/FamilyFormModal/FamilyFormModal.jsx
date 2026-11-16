
import { useEffect, useState } from "react";
import { X, Users, IndianRupee } from "lucide-react";

import "./FamilyFormModal.css";

const EMPTY_FORM = {
    family_name: "",
    opening_relations_spent_minor: "",
    opening_i_spent_minor: "",
};

const toRupees = (minor) => {
    if (minor === null || minor === undefined || minor === "") return "";
    return (Number(minor) / 100).toString();
};

const toMinor = (rupees) => {
    if (rupees === "" || rupees === null || rupees === undefined) {
        return 0;
    }

    return Math.round(Number(rupees) * 100);
};

function FamilyFormModal({
    isOpen,
    family,
    familyType,
    saving = false,
    onClose,
    onSubmit,
}) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        setForm(
            family
                ? {
                    family_name: family.family_name || "",
                    opening_relations_spent_minor: toRupees(
                        family.opening_relations_spent_minor
                    ),
                    opening_i_spent_minor: toRupees(
                        family.opening_i_spent_minor
                    ),
                }
                : EMPTY_FORM
        );

        setFormError("");
    }, [isOpen, family]);

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

        const familyName = form.family_name.trim();

        if (!familyName) {
            setFormError("Please enter a family name.");
            return;
        }

        const relationsAmount = Number(
            form.opening_relations_spent_minor || 0
        );

        const myAmount = Number(form.opening_i_spent_minor || 0);

        if (
            !Number.isFinite(relationsAmount) ||
            !Number.isFinite(myAmount) ||
            relationsAmount < 0 ||
            myAmount < 0
        ) {
            setFormError("Please enter valid, non-negative amounts.");
            return;
        }

        const payload = {
            family_name: familyName,
            family_type: familyType,
            opening_relations_spent_minor: toMinor(
                form.opening_relations_spent_minor
            ),
            opening_i_spent_minor: toMinor(
                form.opening_i_spent_minor
            ),
        };

        try {
            await onSubmit(payload);
        } catch {
            // The parent displays the save error.
        }
    };

    return (
        <div
            className="family-modal-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) {
                    onClose();
                }
            }}
        >
            <div
                className="family-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="family-modal-title"
            >
                <div className="family-modal-header">
                    <div className="family-modal-heading-icon">
                        <Users size={22} />
                    </div>

                    <div>
                        <h2 id="family-modal-title">
                            {family ? "Edit Relation Family" : "Create Relation Family"}
                        </h2>
                        <p>
                            Add family details and any previous balances.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="family-modal-close"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="family-modal-body">

                        <div className="family-form-field">
                            <label htmlFor="family_name">Family Name *</label>

                            <input
                                id="family_name"
                                name="family_name"
                                type="text"
                                value={form.family_name}
                                onChange={handleChange}
                                placeholder="e.g. Mani Family"
                                maxLength={100}
                                autoFocus
                                required
                            />
                        </div>

                        <div className="family-opening-heading">
                            <div>
                                <h3>Opening Balances</h3>
                                <p>
                                    Optional amounts from before using this tracker.
                                </p>
                            </div>
                        </div>

                        <div className="family-opening-field received">
                            <label htmlFor="opening_relations_spent_minor">
                                Total relations spent to me
                            </label>

                            <div className="family-amount-input">
                                <IndianRupee size={17} />
                                <input
                                    id="opening_relations_spent_minor"
                                    name="opening_relations_spent_minor"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.opening_relations_spent_minor}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="family-opening-field given">
                            <label htmlFor="opening_i_spent_minor">
                                Total I spent to them
                            </label>

                            <div className="family-amount-input">
                                <IndianRupee size={17} />
                                <input
                                    id="opening_i_spent_minor"
                                    name="opening_i_spent_minor"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.opening_i_spent_minor}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {formError && (
                            <div className="family-form-error">
                                {formError}
                            </div>
                        )}
                    </div>

                    <div className="family-modal-footer">
                        <button
                            type="button"
                            className="family-cancel-button"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="family-save-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : family
                                    ? "Update Family"
                                    : "Create Family"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FamilyFormModal;
