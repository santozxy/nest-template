import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateUser, UpdateUser } from '../entities/user.entity';
import { UserContract } from './user.contract';

@Injectable()
export class UserRepository implements UserContract {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: CreateUser) {
    return this.prisma.user.create({
      data: user,
    });
  }

  async findById(tenantId: string, id: string) {
    return this.prisma.user.findFirst({
      where: { id, tenantId },
    });
  }

  async findByCpf(tenantId: string, cpf: string) {
    return this.prisma.user.findFirst({
      where: { cpf, tenantId },
    });
  }

  async findByEmail(tenantId: string, email: string) {
    return this.prisma.user.findFirst({
      where: { email, tenantId },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(tenantId: string, id: string, user: UpdateUser) {
    return this.prisma.user.update({
      where: {
        tenantId_id: {
          tenantId,
          id,
        },
      },
      data: user,
    });
  }

  async delete(tenantId: string, id: string) {
    await this.prisma.user.delete({
      where: {
        tenantId_id: {
          tenantId,
          id,
        },
      },
    });
  }
}
