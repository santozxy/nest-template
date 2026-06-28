import { CreateTenant, Tenant } from '../entities/tenant.entity';

export abstract class TenantContract {
  abstract create(data: CreateTenant): Promise<Tenant>;
  abstract findById(id: string): Promise<Tenant | null>;
  abstract findBySlug(slug: string): Promise<Tenant | null>;
}
