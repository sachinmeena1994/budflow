
import { User, AccessRole } from "@/components/users/types";

/**
 * In-memory storage for mock user data
 */
let mockUsers: User[] = [
  {
    id: "user-1",
    name: "Gautam Vanani",
    email: "gautam.vanani@gtigrows.com",
    role: AccessRole.ADMIN,
    active: true,
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    inventoryLocationAccess: ["disp-1", "disp-2", "disp-3"]
  },
  {
    id: "user-2",
    name: "Antonio Jones",
    email: "antonio.jones@example.com",
    role: AccessRole.MENU_MANAGER,
    active: true,
    lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    inventoryLocationAccess: ["disp-1", "disp-2"]
  },
  {
    id: "user-3",
    name: "Joseph Turcotte",
    email: "joseph.turcotte@example.com",
    role: AccessRole.ADMIN,
    active: true,
    lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    inventoryLocationAccess: ["disp-1", "disp-2", "disp-3"]
  },
  {
    id: "user-4",
    name: "Kayla Millwood",
    email: "kayla.millwood@example.com",
    role: AccessRole.MENU_MANAGER,
    active: true,
    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    inventoryLocationAccess: ["disp-2"]
  },
  {
    id: "user-5",
    name: "Patrick Hannigan",
    email: "patrick.hannigan@example.com",
    role: AccessRole.SALES,
    active: true,
    lastLogin: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    inventoryLocationAccess: ["disp-3", "disp-1"]
  },
  {
    id: "user-6",
    name: "Valerie Oliver",
    email: "valerie.oliver@example.com",
    role: AccessRole.VIEWER,
    active: false,
    lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    inventoryLocationAccess: ["disp-1"]
  },
  // Adding more sales users with location assignments
  {
    id: "user-7",
    name: "Jessica Martinez",
    email: "jessica.martinez@example.com",
    role: AccessRole.SALES,
    active: true,
    lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    inventoryLocationAccess: ["disp-2", "disp-3"]
  },
  {
    id: "user-8",
    name: "Michael Chen",
    email: "michael.chen@example.com",
    role: AccessRole.SALES,
    active: true,
    lastLogin: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    inventoryLocationAccess: ["disp-1", "disp-2"]
  },
  {
    id: "user-9",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    role: AccessRole.SALES,
    active: true,
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    inventoryLocationAccess: ["disp-3"]
  },
  {
    id: "user-10",
    name: "David Williams",
    email: "david.williams@example.com",
    role: AccessRole.SALES,
    active: true,
    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    inventoryLocationAccess: ["disp-1", "disp-2", "disp-3"]
  }
];

/**
 * Mock data service for users
 */
export const mockUserData = {
  /**
   * Get all users
   */
  getUsers(): User[] {
    return [...mockUsers];
  },
  
  /**
   * Get user by ID
   */
  getUserById(userId: string): User | undefined {
    return mockUsers.find(user => user.id === userId);
  },
  
  /**
   * Create a new user
   */
  createUser(userData: Omit<User, "id">): User {
    const newUser = {
      ...userData,
      id: `user-${Date.now()}`
    };
    mockUsers.push(newUser);
    return newUser;
  },
  
  /**
   * Update an existing user
   */
  updateUser(userId: string, updates: Partial<User>): User | undefined {
    const index = mockUsers.findIndex(user => user.id === userId);
    if (index === -1) return undefined;
    
    mockUsers[index] = {
      ...mockUsers[index],
      ...updates
    };
    
    return mockUsers[index];
  },
  
  /**
   * Delete a user
   */
  deleteUser(userId: string): boolean {
    const initialLength = mockUsers.length;
    mockUsers = mockUsers.filter(user => user.id !== userId);
    return mockUsers.length < initialLength;
  },
  
  /**
   * Update user's role
   */
  updateUserRole(userId: string, role: AccessRole): User | undefined {
    const index = mockUsers.findIndex(user => user.id === userId);
    if (index === -1) return undefined;
    
    mockUsers[index] = {
      ...mockUsers[index],
      role
    };
    
    return mockUsers[index];
  }
};
