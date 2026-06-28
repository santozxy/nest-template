import { Body, Controller, Param, Put } from '@nestjs/common';
import { CurrentUser } from '@/modules/auth/infrastructure/decorators/current.user.decorator';
import { UserPayload } from '@/modules/auth/infrastructure/jwt/jwt.strategy';
import { UpdateUserDto } from '../dtos/update.user.dto';
import { UpdateUserService } from '../services/update.user.service';

@Controller('users')
export class UserUpdateController {
  constructor(private readonly updateUser: UpdateUserService) {}

  @Put(':id')
  async update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ) {
    return this.updateUser.execute(user.tenantId, id, body);
  }
}
