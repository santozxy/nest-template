import { NotFoundException } from '@/common/domain/http.errors';
import { Injectable } from '@nestjs/common';
import { UserContract } from '../repositories/user.contract';
import { withoutUserPassword } from '../utils/user.without.password.util';

@Injectable()
export class FindUserByIdService {
  constructor(private readonly users: UserContract) {}

  async execute(tenantId: string, id: string) {
    const user = await this.users.findById(id);

    if (!user || user.tenantId !== tenantId) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return withoutUserPassword(user);
  }
}
