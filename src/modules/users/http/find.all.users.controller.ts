import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '@/modules/auth/infrastructure/decorators/current.user.decorator';
import { UserPayload } from '@/modules/auth/infrastructure/jwt/jwt.strategy';
import { FindAllUsersService } from '../services/find.all.users.service';

@Controller('users')
export class FindAllUsersController {
  constructor(private readonly findAll: FindAllUsersService) {}

  @Get()
  async list(@CurrentUser() user: UserPayload) {
    return this.findAll.execute(user.tenantId);
  }
}
