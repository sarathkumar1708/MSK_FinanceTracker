
import { supabase } from "../lib/supabase";

export const roleService = {
    // Get all roles and their assigned component keys
    async getRoles() {
        const { data, error } = await supabase
            .from("roles")
            .select(`
        id,
        name,
        description,
        created_at,
        role_components (
          component_key
        )
      `)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return (data || []).map((role) => ({
            ...role,
            componentKeys: (role.role_components || []).map(
                (item) => item.component_key
            ),
        }));
    },

    // Create a role and assign component permissions
    async createRole({ name, description, componentKeys }) {
        const { data: role, error: roleError } = await supabase
            .from("roles")
            .insert({
                name: name.trim(),
                description: description?.trim() || null,
            })
            .select()
            .single();

        if (roleError) throw roleError;

        if (componentKeys.length > 0) {
            const rows = componentKeys.map((componentKey) => ({
                role_id: role.id,
                component_key: componentKey,
            }));

            const { error: permissionsError } = await supabase
                .from("role_components")
                .insert(rows);

            if (permissionsError) {
                // Clean up the role if saving permissions fails
                await supabase.from("roles").delete().eq("id", role.id);
                throw permissionsError;
            }
        }

        return role;
    },

    // Get users from the public profiles table
    async getUsers() {
        const { data, error } = await supabase
            .from("profiles")
            .select(`
        id,
        email,
        full_name,
        avatar_url,
        is_admin,
        user_roles (
          role_id,
          roles (
            id,
            name
          )
        )
      `)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return (data || []).map((user) => ({
            ...user,
            assignedRoles: (user.user_roles || [])
                .map((item) => item.roles)
                .filter(Boolean),
        }));
    },

    // Assign a role to a user
    async assignRole(userId, roleId) {
        const { error } = await supabase
            .from("user_roles")
            .upsert(
                {
                    user_id: userId,
                    role_id: roleId,
                },
                {
                    onConflict: "user_id,role_id",
                    ignoreDuplicates: true,
                }
            );

        if (error) throw error;
    },

    // Remove a role assignment
    async removeRole(userId, roleId) {
        const { error } = await supabase
            .from("user_roles")
            .delete()
            .eq("user_id", userId)
            .eq("role_id", roleId);

        if (error) throw error;
    },


    async updateRole(roleId, roleData) {
        const { name, description, componentKeys = [] } = roleData;

        const { error: roleError } = await supabase
            .from("roles")
            .update({
                name: name.trim(),
                description: description?.trim() || ""
            })
            .eq("id", roleId);

        if (roleError) throw roleError;

        // Replace existing role permissions.
        const { error: deleteError } = await supabase
            .from("role_components")
            .delete()
            .eq("role_id", roleId);

        if (deleteError) throw deleteError;

        if (componentKeys.length > 0) {
            const permissions = componentKeys.map((componentKey) => ({
                role_id: roleId,
                component_key: componentKey
            }));

            const { error: insertError } = await supabase
                .from("role_components")
                .insert(permissions);

            if (insertError) throw insertError;
        }
    },

    async deleteRole(roleId) {
        // Prevent deleting a role that is assigned to users.
        const { data: assignments, error: assignmentError } = await supabase
            .from("user_roles")
            .select("role_id")
            .eq("role_id", roleId)
            .limit(1);

        if (assignmentError) throw assignmentError;

        if (assignments?.length > 0) {
            throw new Error(
                "This role is assigned to users. Reassign those users before deleting it."
            );
        }

        // Delete role permissions first.
        const { error: permissionError } = await supabase
            .from("role_components")
            .delete()
            .eq("role_id", roleId);

        if (permissionError) throw permissionError;

        const { error } = await supabase
            .from("roles")
            .delete()
            .eq("id", roleId);

        if (error) throw error;
    },

    // Get the current user's effective component permissions
    async getMyPermissions() {
        // 1. Get the currently authenticated user
        const { data: authData, error: authError } =
            await supabase.auth.getUser();

        if (authError) throw authError;

        const user = authData.user;

        if (!user) {
            return {
                userId: null,
                isAdmin: false,
                componentKeys: [],
            };
        }

        // // TEMPORARY DEBUG CODE
        // const { data, error } = await supabase
        //     .from("roles")
        //     .select("id, name")
        //     .eq("id", "4debd985-e05d-4b97-90e6-b44e419a6188");

        // console.log("Direct role query:", data);
        // console.log("Direct role query error:", error);

        // // Continue with your existing profile query
        // const { data: profile, error: profileError } = await supabase
        //     .from("profiles")
        //     .select("is_admin")
        //     .eq("id", user.id)
        //     .single();



        // // 2. Check whether the user is an admin
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single();

        if (profileError) throw profileError;

        // 3. Admin gets access to all components
        if (profile?.is_admin === true) {
            return {
                userId: user.id,
                isAdmin: true,
                componentKeys: ["*"],
            };
        }

        // 4. Fetch all roles assigned to this user
        const { data: assignments, error: assignmentError } =
            await supabase
                .from("user_roles")
                .select(`
              role_id,
              roles (
                id,
                name,
                role_components (
                  component_key
                )
              )
            `)
                .eq("user_id", user.id);

        if (assignmentError) throw assignmentError;

        // 5. Collect permissions from every assigned role
        const componentKeys = [
            ...new Set(
                (assignments || []).flatMap((assignment) => {
                    const roles = Array.isArray(assignment.roles)
                        ? assignment.roles
                        : [assignment.roles].filter(Boolean);

                    return roles.flatMap((role) =>
                        (role.role_components || []).map(
                            (item) => item.component_key
                        )
                    );
                })
            ),
        ];


        // 6. Return unique permissions
        return {
            userId: user.id,
            isAdmin: false,
            componentKeys,
        };
    },
};
