import { NotFoundException } from '@/common/domain/http.errors';
import { Injectable } from '@nestjs/common';
import { withoutUserPassword } from '../entities/user.entity';
import { UserContract } from '../repositories/user.contract';

@Injectable()
export class FindUserByIdService {
  constructor(private readonly users: UserContract) {}

  async execute(tenantId: string, id: string) {
    const user = await this.users.findById(tenantId, id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return withoutUserPassword(user);
  }
}
