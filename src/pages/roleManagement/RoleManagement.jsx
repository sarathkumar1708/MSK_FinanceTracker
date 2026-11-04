
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

  const handleCreateRole = async (roleData) => {
    await roleService.createRole(roleData);
    await loadRoles();
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
          onClick={() => setIsCreateOpen(true)}
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
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading roles...</p>
        ) : error ? (
          <p className="role-error">{error}</p>
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
                </tr>
              </thead>

              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td><strong>{role.name}</strong></td>
                    <td>{role.description || "—"}</td>
                    <td>
                      <span className="role-tag">
                        {role.componentKeys.length} pages
                      </span>
                    </td>
                    <td>
                      {new Date(role.created_at).toLocaleDateString()}
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
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateRole}
        availableComponents={availableComponents}
      />
    </div>
  );
}

export default RoleManagement;
