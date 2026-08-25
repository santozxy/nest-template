import { UnauthorizedException } from '@/common/domain/http.errors';
import { Encrypter } from '@/modules/cryptography/repositories/encrypter.contract';
import { HashComparer } from '@/modules/cryptography/repositories/hash.compare.contract';
import { UserContract } from '@/modules/users/repositories/user.contract';
import { withoutUserPassword } from '@/modules/users/utils/user.without.password.util';
import { Injectable } from '@nestjs/common';

export interface AuthLogin {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserContract,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
  ) {}

  async execute({ email, password }: AuthLogin) {
    const user = await this.users.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email ou senha incorretos.');
    }

    const isPasswordCorrect = await this.hashComparer.compare(
      password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Email ou senha incorretos.');
    }

    const token = await this.encrypter.encrypt({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
    });

    return {
      token,
      user: withoutUserPassword(user),
    };
  }
}
