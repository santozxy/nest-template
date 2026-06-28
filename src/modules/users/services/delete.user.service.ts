import { NotFoundException } from '@/common/domain/http.errors';
import { Injectable } from '@nestjs/common';
import { UserContract } from '../repositories/user.contract';

@Injectable()
export class DeleteUserService {
  constructor(private readonly users: UserContract) {}

  async execute(tenantId: string, id: string) {
    const user = await this.users.findById(tenantId, id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    await this.users.delete(tenantId, id);
  }
}
