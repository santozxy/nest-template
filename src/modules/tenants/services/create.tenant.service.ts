import { ConflictException } from '@/common/domain/http.errors';
import { Injectable } from '@nestjs/common';
import { CreateTenant } from '../entities/tenant.entity';
import { TenantContract } from '../repositories/tenant.contract';

@Injectable()
export class CreateTenantService {
  constructor(private readonly tenants: TenantContract) {}

  async execute(data: CreateTenant) {
    const existingTenant = await this.tenants.findBySlug(data.slug);

    if (existingTenant) {
      throw new ConflictException('Já existe um tenant com esse slug.');
    }

    return this.tenants.create(data);
  }
}
