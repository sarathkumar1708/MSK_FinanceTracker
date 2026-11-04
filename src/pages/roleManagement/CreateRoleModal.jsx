
import { useState } from "react";

function CreateRoleModal({
  isOpen,
  onClose,
  onCreate,
  availableComponents = [],
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const toggleComponent = (key) => {
    setSelectedKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Please enter a role name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onCreate({
        name,
        description,
        componentKeys: selectedKeys,
      });

      setName("");
      setDescription("");
      setSelectedKeys([]);
      onClose();
    } catch (err) {
      setError(err.message || "Unable to create role.");
    } finally {
      setLoading(false);
    }
  };

  const groupedComponents = availableComponents.reduce((groups, item) => {
    const group = item.group || "Other";
    groups[group] = [...(groups[group] || []), item];
    return groups;
  }, {});

  return (
    <div className="role-modal-overlay">
      <div className="role-modal">
        <div className="role-modal-header">
          <div>
            <h2>Create Role</h2>
            <p>Select the pages this role can access.</p>
          </div>
          <button type="button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Role Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Example: Finance Manager"
            required
          />

          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this role"
            rows={2}
          />

          <div className="role-permission-heading">
            <strong>Page Permissions</strong>
            <span>{selectedKeys.length} selected</span>
          </div>

          <div className="role-permission-list">
            {Object.entries(groupedComponents).map(([group, items]) => (
              <section key={group} className="permission-group">
                <h4>{group}</h4>

                {items.map((item) => (
                  <label className="permission-option" key={item.key}>
                    <input
                      type="checkbox"
                      checked={selectedKeys.includes(item.key)}
                      onChange={() => toggleComponent(item.key)}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </section>
            ))}
          </div>

          {error && <p className="role-error">{error}</p>}

          <div className="role-modal-actions">
            <button type="button" onClick={onClose} className="secondary-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? "Creating..." : "Create Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRoleModal;
