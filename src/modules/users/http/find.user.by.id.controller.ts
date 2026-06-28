import { Controller, Get, Param } from '@nestjs/common';
import { CurrentUser } from '@/modules/auth/infrastructure/decorators/current.user.decorator';
import { UserPayload } from '@/modules/auth/infrastructure/jwt/jwt.strategy';
import { FindUserByIdService } from '../services/find.users.by.id.service';

@Controller('users/:id')
export class FindUserByIdController {
  constructor(private readonly findById: FindUserByIdService) {}

  @Get()
  async get(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.findById.execute(user.tenantId, id);
  }
}
