import {
  ConflictException,
  NotFoundException,
} from '@/common/domain/http.errors';
import { HashGenerator } from '@/modules/cryptography/repositories/hash.generator.contract';
import { TenantContract } from '@/modules/tenants/repositories/tenant.contract';
import { Injectable } from '@nestjs/common';
import { CreateUser, withoutUserPassword } from '../entities/user.entity';
import { UserContract } from '../repositories/user.contract';

@Injectable()
export class CreateUserService {
  constructor(
    private readonly users: UserContract,
    private readonly tenants: TenantContract,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute(body: CreateUser) {
    const tenant = await this.tenants.findById(body.tenantId);

    if (!tenant || !tenant.isActive) {
      throw new NotFoundException('Tenant não encontrado ou inativo.');
    }

    const [cpfExists, emailExists] = await Promise.all([
      this.users.findByCpf(body.tenantId, body.cpf),
      this.users.findByEmail(body.tenantId, body.email),
    ]);

    if (cpfExists) {
      throw new ConflictException(
        'Já existe um usuário com esse CPF neste tenant.',
      );
    }

    if (emailExists) {
      throw new ConflictException(
        'Já existe um usuário com esse email neste tenant.',
      );
    }

    body.password = await this.hashGenerator.hash(body.password);

    const user = await this.users.create(body);

    return withoutUserPassword(user);
  }
}
