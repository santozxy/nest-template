import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Public } from '@/modules/auth/infrastructure/decorators/public.decorator';
import { CreateTenantDto } from '../dtos/create.tenant.dto';
import { CreateTenantService } from '../services/create.tenant.service';

@Controller('tenants')
@Public()
export class CreateTenantController {
  constructor(private readonly createTenant: CreateTenantService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() body: CreateTenantDto) {
    return this.createTenant.execute(body);
  }
}
