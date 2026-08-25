export const UserRole = {
  admin: 'admin',
  member: 'member',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type PublicUser = Omit<User, 'password'>;

export interface CreateUser {
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUser {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: UserRole;
}
