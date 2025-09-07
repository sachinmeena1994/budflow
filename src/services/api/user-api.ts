
import { apiClient } from "./api-client";
import { mockUserData } from "../mock-data/user-data";
import { User, AccessRole } from "@/components/users/types";

/**
 * User API service
 */
export const userApi = {
  /**
   * Fetch all users
   */
  async fetchUsers(): Promise<User[]> {
    const users = mockUserData.getUsers();
    
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
      return users;
    }
    return apiClient.mockCall(users, { delay: 900 });
  },
  
  /**
   * Fetch a specific user
   */
  async fetchUser(userId: string): Promise<User> {
    const user = mockUserData.getUserById(userId);
    if (!user) {
      return apiClient.mockCall(null as any, { shouldFail: true, errorMessage: "User not found" });
    }
    
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
      return user;
    }
    return apiClient.mockCall(user);
  },
  
  /**
   * Create a new user
   */
  async createUser(userData: Omit<User, "id">): Promise<User> {
    const newUser = mockUserData.createUser(userData);
    
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
      return newUser;
    }
    return apiClient.mockCall(newUser, { delay: 1200 });
  },
  
  /**
   * Update an existing user
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const updatedUser = mockUserData.updateUser(userId, updates);
    if (!updatedUser) {
      return apiClient.mockCall(null as any, { shouldFail: true, errorMessage: "User not found" });
    }
    
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
      return updatedUser;
    }
    return apiClient.mockCall(updatedUser, { delay: 800 });
  },
  
  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<void> {
    const success = mockUserData.deleteUser(userId);
    if (!success) {
      return apiClient.mockCall(null as any, { shouldFail: true, errorMessage: "User not found" });
    }
    
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
      return;
    }
    return apiClient.mockCall(undefined, { delay: 600 });
  },
  
  /**
   * Update user access role
   */
  async updateUserRole(userId: string, role: AccessRole): Promise<User> {
    const updatedUser = mockUserData.updateUserRole(userId, role);
    if (!updatedUser) {
      return apiClient.mockCall(null as any, { shouldFail: true, errorMessage: "User not found" });
    }
    
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
      return updatedUser;
    }
    return apiClient.mockCall(updatedUser, { delay: 400 });
  },
  
  /**
   * Reset user password (mock implementation)
   */
  async resetPassword(userId: string): Promise<{ success: boolean }> {
    const user = mockUserData.getUserById(userId);
    if (!user) {
      return apiClient.mockCall(null as any, { shouldFail: true, errorMessage: "User not found" });
    }
    
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
      return { success: true };
    }
    return apiClient.mockCall({ success: true }, { delay: 700 });
  },
  
  /**
   * Toggle user active status
   */
  async toggleUserStatus(userId: string): Promise<User> {
    const user = mockUserData.getUserById(userId);
    if (!user) {
      return apiClient.mockCall(null as any, { shouldFail: true, errorMessage: "User not found" });
    }
    
    const updatedUser = mockUserData.updateUser(userId, { active: !user.active });
    if (!updatedUser) {
      return apiClient.mockCall(null as any, { shouldFail: true, errorMessage: "Failed to update user status" });
    }
    
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
      return updatedUser;
    }
    return apiClient.mockCall(updatedUser, { delay: 500 });
  }
};
