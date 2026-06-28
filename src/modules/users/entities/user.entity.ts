import { UserRole } from '@prisma/client';

export { UserRole };

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  cpf: string;
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
  cpf: string;
  phone: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUser {
  name?: string;
  email?: string;
  cpf?: string;
  phone?: string;
  password?: string;
  role?: UserRole;
}

export function withoutUserPassword(user: User): PublicUser {
  const { password, ...publicUser } = user;

  void password;

  return publicUser;
}
