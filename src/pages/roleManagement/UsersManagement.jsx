
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { roleService } from "../../services/roleService";
import AssignRoleModal from "./AssignRoleModal";
import { fetchMyPermissions } from "../../features/permissions/permissionSlice";
import { supabase } from "../../lib/supabase";

function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const dispatch = useDispatch();
  const [roles, setRoles] = useState([]);


  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await roleService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const handleSaveRoles = async (userId, selectedRoleIds) => {
    const existingUser = users.find((item) => item.id === userId);
    const existingRoleIds = (existingUser?.assignedRoles || []).map(
      (role) => role.id
    );

    const rolesToAdd = selectedRoleIds.filter(
      (id) => !existingRoleIds.includes(id)
    );

    const rolesToRemove = existingRoleIds.filter(
      (id) => !selectedRoleIds.includes(id)
    );

    // Apply additions and removals
    for (const roleId of rolesToAdd) {
      await roleService.assignRole(userId, roleId);
    }

    for (const roleId of rolesToRemove) {
      await roleService.removeRole(userId, roleId);
    }

    await loadUsers();

    const { data } = await supabase.auth.getUser();

if (data.user?.id === userId) {
  await dispatch(fetchMyPermissions());
}
  };

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
  

  return (
    <section className="users-management">
      <div className="role-section-heading">
        <div>
          <h2>Users</h2>
          <p>Manage user role assignments.</p>
        </div>

        <button type="button" onClick={loadUsers} className="secondary-btn">
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p className="role-error">{error}</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="role-table-wrapper">
          <table className="role-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Assigned Roles</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.full_name || "—"}</td>
                  <td>{user.email || "—"}</td>
                  <td>
                    {user.is_admin ? (
                      <span className="role-tag admin-tag">Admin</span>
                    ) : user.assignedRoles.length > 0 ? (
                      <div className="role-tags">
                        {user.assignedRoles.map((role) => (
                          <span className="role-tag" key={role.id}>
                            {role.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="muted-text">No roles assigned</span>
                    )}
                  </td>
                  <td>
                    {user.is_admin ? (
                      <span className="muted-text">Administrator</span>
                    ) : (
                      <button
                        type="button"
                        className="text-btn"
                        onClick={() => setSelectedUser(user)}
                      >
                        Assign Roles
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AssignRoleModal
        isOpen={Boolean(selectedUser)}
        user={selectedUser}
        roles={roles}
        onClose={() => setSelectedUser(null)}
        onSave={handleSaveRoles}
      />
    </section>
  );
}

export default UsersManagement;
