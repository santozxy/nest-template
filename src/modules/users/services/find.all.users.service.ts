import { Injectable } from '@nestjs/common';
import { withoutUserPassword } from '../entities/user.entity';
import { UserContract } from '../repositories/user.contract';

@Injectable()
export class FindAllUsersService {
  constructor(private readonly users: UserContract) {}

  async execute(tenantId: string) {
    const users = await this.users.findAll(tenantId);

    return users.map(withoutUserPassword);
  }
}
