export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
  active?: boolean;
  avatar?: string;
  markets?: string[]; // Array of market IDs the user has access to
}
