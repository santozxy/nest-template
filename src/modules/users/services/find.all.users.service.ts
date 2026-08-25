import { Injectable } from '@nestjs/common';
import { FindAllUsersDto } from '../dtos/find.all.users.dto';
import { UserContract } from '../repositories/user.contract';
import { withoutUserPassword } from '../utils/user.without.password.util';

@Injectable()
export class FindAllUsersService {
  constructor(private readonly users: UserContract) {}

  async execute(tenantId: string, filters: FindAllUsersDto) {
    const users = await this.users.findAll({
      tenantId,
      page: filters.page ?? 1,
      perPage: filters.perPage ?? 10,
    });

    return {
      ...users,
      data: users.data.map(withoutUserPassword),
    };
  }
}
