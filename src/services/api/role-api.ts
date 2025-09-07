
import { apiClient } from "./api-client";
import { mockRoleData } from "../mock-data/role-data";
import { mockPermissionData } from "../mock-data/permission-data";
import { RoleDefinition, AccessPermission, PermissionMatrix } from "@/components/users/types";

/**
 * Role API service
 */
export const roleApi = {
  /**
   * Fetch all roles
   */
  async fetchRoles(): Promise<RoleDefinition[]> {
    const roles = mockRoleData.getRoles();
    
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
      return roles;
    }
    return apiClient.mockCall(roles, { delay: 800 });
  },
  
  /**
   * Fetch a specific role
   */
  async fetchRole(roleId: string): Promise<RoleDefinition> {
    const role = mockRoleData.getRoleById(roleId);
    if (!role) {
      return apiClient.mockCall(null as any, { shouldFail: true, errorMessage: "Role not found" });
    }
    
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
      return role;
    }
    return apiClient.mockCall(role);
  },
  
  /**
   * Create a new role
   */
  async createRole(roleData: Omit<RoleDefinition, "id">): Promise<RoleDefinition> {
    const newRole = mockRoleData.createRole(roleData);
    
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
      return newRole;
    }
    return apiClient.mockCall(newRole, { delay: 1000 });
  },
  
  /**
   * Update an existing role
   */
  async updateRole(roleId: string, updates: Partial<RoleDefinition>): Promise<RoleDefinition> {
    const updatedRole = mockRoleData.updateRole(roleId, updates);
    if (!updatedRole) {
      return apiClient.mockCall(null as any, { shouldFail: true, errorMessage: "Role not found" });
    }
    
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
      return updatedRole;
    }
    return apiClient.mockCall(updatedRole, { delay: 700 });
  },
  
  /**
   * Delete a role
   */
  async deleteRole(roleId: string): Promise<void> {
    const success = mockRoleData.deleteRole(roleId);
    if (!success) {
      return apiClient.mockCall(null as any, { shouldFail: true, errorMessage: "Role not found" });
    }
    
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
      return;
    }
    return apiClient.mockCall(undefined, { delay: 500 });
  },
  
  /**
   * Fetch all permissions
   */
  async fetchPermissions(): Promise<AccessPermission[]> {
    const permissions = mockPermissionData.getPermissions();
    
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
      return permissions;
    }
    return apiClient.mockCall(permissions, { delay: 600 });
  },
  
  /**
   * Fetch permissions by module
   */
  async fetchPermissionsByModule(module: string): Promise<AccessPermission[]> {
    const permissions = mockPermissionData.getPermissionsByModule(module);
    
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
      return permissions;
    }
    return apiClient.mockCall(permissions, { delay: 400 });
  },
  
  /**
   * Fetch all available modules
   */
  async fetchModules(): Promise<string[]> {
    const modules = mockPermissionData.getModules();
    
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
      return modules;
    }
    return apiClient.mockCall(modules, { delay: 300 });
  },
  
  /**
   * Get permission matrix for a role
   */
  async getPermissionMatrix(roleId: string): Promise<PermissionMatrix> {
    const matrix = mockRoleData.getPermissionMatrix(roleId) as PermissionMatrix;
    
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
      return matrix;
    }
    return apiClient.mockCall(matrix, { delay: 700 });
  }
};
