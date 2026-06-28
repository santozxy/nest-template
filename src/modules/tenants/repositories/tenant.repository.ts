import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateTenant } from '../entities/tenant.entity';
import { TenantContract } from './tenant.contract';

@Injectable()
export class TenantRepository implements TenantContract {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTenant) {
    return this.prisma.tenant.create({ data });
  }

  async findById(id: string) {
    return this.prisma.tenant.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.tenant.findUnique({
      where: { slug },
    });
  }
}
