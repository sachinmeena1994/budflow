
import { RoleDefinition, AccessRole } from "@/components/users/types";
import { mockPermissionData } from "./permission-data";

// Mock roles data with permissions
let mockRoles: RoleDefinition[] = [
  {
    id: "role-1",
    name: "Admin",
    description: "Full system access with all permissions",
    permissions: mockPermissionData.getPermissions().map(p => p.id)
  },
  {
    id: "role-2",
    name: "Manager",
    description: "Can manage inventory, orders, and view reports",
    permissions: [
      ...mockPermissionData.getPermissionsByModule("inventory").map(p => p.id),
      ...mockPermissionData.getPermissionsByModule("orders").map(p => p.id),
      "perm-9", "perm-13", "perm-17" // View permissions for users, menus, and reconciliation
    ]
  },
  {
    id: "role-3",
    name: "Staff",
    description: "Basic operational access",
    permissions: [
      "perm-1", "perm-5", "perm-13", // View inventory, orders, menus
      "perm-6", "perm-7" // Create and update orders
    ]
  },
  {
    id: "role-4",
    name: "Read-only",
    description: "View-only access to all modules",
    permissions: [
      "perm-1", "perm-5", "perm-9", "perm-13", "perm-17" // View permissions only
    ]
  }
];

// Function to map role name to AccessRole type
const mapRoleNameToType = (name: string): AccessRole => {
  const normalizedName = name.toLowerCase();
  if (normalizedName === "admin") return AccessRole.ADMIN;
  if (normalizedName === "manager") return AccessRole.MENU_MANAGER;
  if (normalizedName === "sales") return AccessRole.SALES;
  if (normalizedName === "picker") return AccessRole.PICKER;
  if (normalizedName === "compliance") return AccessRole.OPS;
  return AccessRole.VIEWER;
};

export const mockRoleData = {
  getRoles: () => [...mockRoles],
  
  getRoleById: (id: string) => 
    mockRoles.find(role => role.id === id),
    
  getRoleByName: (name: string) => 
    mockRoles.find(role => role.name.toLowerCase() === name.toLowerCase()),
    
  getRoleByType: (type: AccessRole) => 
    mockRoles.find(role => mapRoleNameToType(role.name) === type),

  createRole: (roleData: Omit<RoleDefinition, "id">) => {
    const newRole = {
      ...roleData,
      id: `role-${Date.now()}`
    };
    mockRoles.push(newRole);
    return newRole;
  },
  
  updateRole: (id: string, updates: Partial<RoleDefinition>) => {
    const index = mockRoles.findIndex(role => role.id === id);
    if (index === -1) return undefined;
    
    mockRoles[index] = {
      ...mockRoles[index],
      ...updates
    };
    
    return mockRoles[index];
  },
  
  deleteRole: (id: string) => {
    const initialLength = mockRoles.length;
    mockRoles = mockRoles.filter(role => role.id !== id);
    return mockRoles.length < initialLength;
  },
  
  // Get permissions matrix by role
  getPermissionMatrix: (roleId: string) => {
    const role = mockRoles.find(role => role.id === roleId);
    if (!role) return {};
    
    const modules = mockPermissionData.getModules();
    const matrix: Record<string, Record<string, boolean>> = {};
    
    modules.forEach(module => {
      const modulePermissions = mockPermissionData.getPermissionsByModule(module);
      
      matrix[module] = {
        view: modulePermissions.some(p => p.name.startsWith('view') && role.permissions.includes(p.id)),
        create: modulePermissions.some(p => p.name.startsWith('create') && role.permissions.includes(p.id)),
        update: modulePermissions.some(p => p.name.startsWith('update') && role.permissions.includes(p.id)),
        delete: modulePermissions.some(p => p.name.startsWith('delete') && role.permissions.includes(p.id))
      };
    });
    
    return matrix;
  }
};
