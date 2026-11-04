
import { useEffect, useState } from "react";

import { navigationItems } from "../../config/navigation";
import { roleService } from "../../services/roleService";

import CreateRoleModal from "./CreateRoleModal";
import "./RoleManagement.css";

const availableComponents = navigationItems.flatMap((item) => {
  if (item.adminOnly) return [];

  if (item.children) {
    return item.children
      .filter((child) => !child.adminOnly)
      .map((child) => ({
        key: child.componentKey,
        label: child.title,
        group: item.title,
      }));
  }

  return [{
    key: item.componentKey,
    label: item.title,
    group: "Other",
  }];
});

function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState(null);

  const loadRoles = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await roleService.getRoles();
      setRoles(data);
    } catch (err) {
      setError(err.message || "Unable to load roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  // Create or update role
  const handleSaveRole = async (roleData) => {
    try {
      setSaving(true);
      setError("");

      if (editingRole) {
        await roleService.updateRole(editingRole.id, roleData);
      } else {
        await roleService.createRole(roleData);
      }

      await loadRoles();

      setIsCreateOpen(false);
      setEditingRole(null);
    } catch (err) {
      console.error("Failed to save role:", err);
      setError(err.message || "Unable to save role.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Open edit modal
  const handleEdit = (role) => {
    setEditingRole(role);
    setIsCreateOpen(true);
  };

  // Delete role
  const handleDelete = async (role) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the "${role.name}" role?`
    );

    if (!confirmed) return;

    try {
      setDeletingRoleId(role.id);
      setError("");

      await roleService.deleteRole(role.id);

      setRoles((current) =>
        current.filter((item) => item.id !== role.id)
      );
    } catch (err) {
      console.error("Failed to delete role:", err);
      setError(err.message || "Unable to delete role.");
    } finally {
      setDeletingRoleId(null);
    }
  };

  const closeModal = () => {
    setIsCreateOpen(false);
    setEditingRole(null);
  };

  return (
    <div className="role-management-page">
      <div className="role-page-header">
        <div>
          <h1>Role Management</h1>
          <p>Create roles and control page access for users.</p>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={() => {
            setEditingRole(null);
            setIsCreateOpen(true);
          }}
        >
          + Create Role
        </button>
      </div>

      <section className="role-section">
        <div className="role-section-heading">
          <div>
            <h2>Created Roles</h2>
            <p>Roles and their page permissions.</p>
          </div>

          <button
            type="button"
            className="secondary-btn"
            onClick={loadRoles}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {error && (
          <p className="role-error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p>Loading roles...</p>
        ) : roles.length === 0 ? (
          <p>No roles created yet. Click Create Role to get started.</p>
        ) : (
          <div className="role-table-wrapper">
            <table className="role-table">
              <thead>
                <tr>
                  <th>Role Name</th>
                  <th>Description</th>
                  <th>Page Permissions</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td>
                      <strong>{role.name}</strong>
                    </td>

                    <td>{role.description || "—"}</td>

                    <td>
                      <span className="role-tag">
                        {(role.componentKeys || []).length} pages
                      </span>
                    </td>

                    <td>
                      {role.created_at
                        ? new Date(role.created_at).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>
                      <div className="role-actions">
                        <button
                          type="button"
                          className="edit-btn"
                          onClick={() => handleEdit(role)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-btn"
                          disabled={deletingRoleId === role.id}
                          onClick={() => handleDelete(role)}
                        >
                          {deletingRoleId === role.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <CreateRoleModal
        isOpen={isCreateOpen}
        onClose={closeModal}
        onCreate={handleSaveRole}
        availableComponents={availableComponents}
        initialRole={editingRole}
        isEditing={Boolean(editingRole)}
        saving={saving}
      />
    </div>
  );
}

export default RoleManagement;
