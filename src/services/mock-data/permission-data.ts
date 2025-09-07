
import { AccessPermission } from "@/components/users/types";

// Mock permissions data
const mockPermissions: AccessPermission[] = [
  // Inventory Module
  { id: "perm-1", name: "view-inventory", description: "View inventory items", module: "inventory" },
  { id: "perm-2", name: "create-inventory", description: "Create inventory items", module: "inventory" },
  { id: "perm-3", name: "update-inventory", description: "Update inventory items", module: "inventory" },
  { id: "perm-4", name: "delete-inventory", description: "Delete inventory items", module: "inventory" },
  
  // Orders Module
  { id: "perm-5", name: "view-orders", description: "View orders", module: "orders" },
  { id: "perm-6", name: "create-orders", description: "Create orders", module: "orders" },
  { id: "perm-7", name: "update-orders", description: "Update order status", module: "orders" },
  { id: "perm-8", name: "delete-orders", description: "Cancel orders", module: "orders" },
  
  // Users Module
  { id: "perm-9", name: "view-users", description: "View users", module: "users" },
  { id: "perm-10", name: "create-users", description: "Create users", module: "users" },
  { id: "perm-11", name: "update-users", description: "Update user information", module: "users" },
  { id: "perm-12", name: "delete-users", description: "Delete users", module: "users" },
  
  // Menus Module
  { id: "perm-13", name: "view-menus", description: "View menus", module: "menus" },
  { id: "perm-14", name: "create-menus", description: "Create menus", module: "menus" },
  { id: "perm-15", name: "update-menus", description: "Update menus", module: "menus" },
  { id: "perm-16", name: "delete-menus", description: "Delete menus", module: "menus" },
  
  // Reconciliation Module
  { id: "perm-17", name: "view-reconciliation", description: "View reconciliation data", module: "reconciliation" },
  { id: "perm-18", name: "create-reconciliation", description: "Create reconciliation", module: "reconciliation" },
  { id: "perm-19", name: "update-reconciliation", description: "Update reconciliation", module: "reconciliation" },
  { id: "perm-20", name: "delete-reconciliation", description: "Delete reconciliation", module: "reconciliation" },
];

// Group permissions by module
export const groupPermissionsByModule = () => {
  const modules: Record<string, AccessPermission[]> = {};
  
  mockPermissions.forEach(permission => {
    if (!modules[permission.module]) {
      modules[permission.module] = [];
    }
    modules[permission.module].push(permission);
  });
  
  return modules;
};

export const mockPermissionData = {
  getPermissions: () => [...mockPermissions],
  
  getPermissionById: (id: string) => 
    mockPermissions.find(permission => permission.id === id),
    
  getPermissionsByModule: (module: string) =>
    mockPermissions.filter(permission => permission.module === module),
    
  getModules: () => 
    [...new Set(mockPermissions.map(permission => permission.module))]
};
