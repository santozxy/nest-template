import {
  ConflictException,
  NotFoundException,
} from '@/common/domain/http.errors';
import { HashGenerator } from '@/modules/cryptography/repositories/hash.generator.contract';
import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from '../dtos/update.user.dto';
import { withoutUserPassword } from '../entities/user.entity';
import { UserContract } from '../repositories/user.contract';

@Injectable()
export class UpdateUserService {
  constructor(
    private readonly users: UserContract,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute(tenantId: string, id: string, body: UpdateUserDto) {
    const user = await this.users.findById(tenantId, id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (body.cpf && body.cpf !== user.cpf) {
      const cpfExists = await this.users.findByCpf(tenantId, body.cpf);

      if (cpfExists) {
        throw new ConflictException(
          'Já existe um usuário com esse CPF neste tenant.',
        );
      }
    }

    if (body.email && body.email !== user.email) {
      const emailExists = await this.users.findByEmail(tenantId, body.email);

      if (emailExists) {
        throw new ConflictException(
          'Já existe um usuário com esse email neste tenant.',
        );
      }
    }

    if (body.password) {
      body.password = await this.hashGenerator.hash(body.password);
    }

    const updatedUser = await this.users.update(tenantId, id, body);

    return withoutUserPassword(updatedUser);
  }
}
