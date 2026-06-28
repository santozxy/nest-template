import { Module } from '@nestjs/common';
import { CreateTenantController } from './http/create.tenant.controller';
import { TenantContract } from './repositories/tenant.contract';
import { TenantRepository } from './repositories/tenant.repository';
import { CreateTenantService } from './services/create.tenant.service';

@Module({
  controllers: [CreateTenantController],
  providers: [
    CreateTenantService,
    {
      provide: TenantContract,
      useClass: TenantRepository,
    },
  ],
  exports: [TenantContract],
})
export class TenantModule {}
