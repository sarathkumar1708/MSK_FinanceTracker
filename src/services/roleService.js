
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

    // Get the current user's effective component permissions
    async getMyPermissions() {
        const { data: authData, error: authError } =
            await supabase.auth.getUser();

        if (authError) throw authError;

        const user = authData.user;

        if (!user) {
            return { userId: null, isAdmin: false, componentKeys: [] };
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single();

        if (profileError) throw profileError;

        if (profile?.is_admin) {
            return {
                userId: user.id,
                isAdmin: true,
                componentKeys: ["*"],
            };
        }

        const { data: assignments, error: assignmentError } =
            await supabase
                .from("user_roles")
                .select(`
          role_id,
          roles (
            role_components (
              component_key
            )
          )
        `)
                .eq("user_id", user.id);

        if (assignmentError) throw assignmentError;

        // Combine permissions from all assigned roles
        const componentKeys = [
            ...new Set(
                (assignments || []).flatMap((assignment) =>
                    (assignment.roles?.role_components || []).map(
                        (item) => item.component_key
                    )
                )
            ),
        ];

        return {
            userId: user.id,
            isAdmin: false,
            componentKeys,
        };
    },
};
