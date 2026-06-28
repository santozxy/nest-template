import { UnauthorizedException } from '@/common/domain/http.errors';
import { Encrypter } from '@/modules/cryptography/repositories/encrypter.contract';
import { HashComparer } from '@/modules/cryptography/repositories/hash.compare.contract';
import { TenantContract } from '@/modules/tenants/repositories/tenant.contract';
import { withoutUserPassword } from '@/modules/users/entities/user.entity';
import { UserContract } from '@/modules/users/repositories/user.contract';
import { Injectable } from '@nestjs/common';

export interface AuthLogin {
  tenantSlug: string;
  cpf: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly tenants: TenantContract,
    private readonly users: UserContract,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
  ) {}

  async execute({ tenantSlug, cpf, password }: AuthLogin) {
    const tenant = await this.tenants.findBySlug(tenantSlug);

    if (!tenant || !tenant.isActive) {
      throw new UnauthorizedException('Tenant inválido ou inativo.');
    }

    const user = await this.users.findByCpf(tenant.id, cpf);

    if (!user) {
      throw new UnauthorizedException('CPF ou senha incorretos.');
    }

    const isPasswordCorrect = await this.hashComparer.compare(
      password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('CPF ou senha incorretos.');
    }

    const token = await this.encrypter.encrypt({
      sub: user.id,
      tenantId: tenant.id,
      role: user.role,
    });

    return {
      token,
      user: withoutUserPassword(user),
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      },
    };
  }
}
