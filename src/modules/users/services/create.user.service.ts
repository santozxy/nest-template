import { ConflictException } from '@/common/domain/http.errors';
import { HashGenerator } from '@/modules/cryptography/repositories/hash.generator.contract';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create.user.dto';
import { UserContract } from '../repositories/user.contract';
import { withoutUserPassword } from '../utils/user.without.password.util';

@Injectable()
export class CreateUserService {
  constructor(
    private readonly users: UserContract,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute(tenantId: string, body: CreateUserDto) {
    const emailExists = await this.users.findByEmail(body.email);

    if (emailExists) {
      throw new ConflictException('Já existe um usuário com esse email.');
    }

    const password = await this.hashGenerator.hash(body.password);

    const user = await this.users.create({ ...body, tenantId, password });

    return withoutUserPassword(user);
  }
}
