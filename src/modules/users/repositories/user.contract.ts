import { CreateUser, UpdateUser, User } from '../entities/user.entity';

export abstract class UserContract {
  abstract create(user: CreateUser): Promise<User>;
  abstract findById(tenantId: string, id: string): Promise<User | null>;
  abstract findByCpf(tenantId: string, cpf: string): Promise<User | null>;
  abstract findByEmail(tenantId: string, email: string): Promise<User | null>;
  abstract findAll(tenantId: string): Promise<User[]>;
  abstract update(
    tenantId: string,
    id: string,
    user: UpdateUser,
  ): Promise<User>;
  abstract delete(tenantId: string, id: string): Promise<void>;
}
