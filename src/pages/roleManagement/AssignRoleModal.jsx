
import { useEffect, useState } from "react";

function AssignRoleModal({
  isOpen,
  onClose,
  user,
  roles = [],
  onSave,
}) {
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && user) {
      setSelectedRoleIds(
        (user.assignedRoles || []).map((role) => role.id)
      );
      setError("");
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const toggleRole = (roleId) => {
    setSelectedRoleIds((current) =>
      current.includes(roleId)
        ? current.filter((id) => id !== roleId)
        : [...current, roleId]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");

    try {
      await onSave(user.id, selectedRoleIds);
      onClose();
    } catch (err) {
      setError(err.message || "Unable to update roles.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-modal-overlay">
      <div className="role-modal assign-role-modal">
        <div className="role-modal-header">
          <div>
            <h2>Assign Roles</h2>
            <p>{user.full_name || user.email}</p>
          </div>
          <button type="button" onClick={onClose}>×</button>
        </div>

        <div className="assign-role-list">
          {roles.length === 0 ? (
            <p>No roles created yet.</p>
          ) : (
            roles.map((role) => (
              <label className="permission-option" key={role.id}>
                <input
                  type="checkbox"
                  checked={selectedRoleIds.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                />
                <span>
                  <strong>{role.name}</strong>
                  {role.description && (
                    <small>{role.description}</small>
                  )}
                </span>
              </label>
            ))
          )}
        </div>

        {error && <p className="role-error">{error}</p>}

        <div className="role-modal-actions">
          <button type="button" onClick={onClose} className="secondary-btn">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="primary-btn"
          >
            {loading ? "Saving..." : "Save Assignments"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignRoleModal;
