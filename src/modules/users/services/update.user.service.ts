import {
  ConflictException,
  NotFoundException,
} from '@/common/domain/http.errors';
import { HashGenerator } from '@/modules/cryptography/repositories/hash.generator.contract';
import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from '../dtos/update.user.dto';
import { UpdateUser } from '../entities/user.entity';
import { UserContract } from '../repositories/user.contract';
import { withoutUserPassword } from '../utils/user.without.password.util';

@Injectable()
export class UpdateUserService {
  constructor(
    private readonly users: UserContract,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute(tenantId: string, id: string, body: UpdateUserDto) {
    const user = await this.users.findById(id);

    if (!user || user.tenantId !== tenantId) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (body.email && body.email !== user.email) {
      const emailExists = await this.users.findByEmail(body.email);

      if (emailExists) {
        throw new ConflictException('Já existe um usuário com esse email.');
      }
    }

    const { password: plainPassword, ...data } = body;
    const updateData: UpdateUser = data;

    if (plainPassword) {
      updateData.password = await this.hashGenerator.hash(plainPassword);
    }

    const updatedUser = await this.users.update(tenantId, id, updateData);

    return withoutUserPassword(updatedUser);
  }
}
