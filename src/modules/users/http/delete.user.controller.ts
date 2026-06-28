import { Controller, Delete, Param } from '@nestjs/common';
import { CurrentUser } from '@/modules/auth/infrastructure/decorators/current.user.decorator';
import { UserPayload } from '@/modules/auth/infrastructure/jwt/jwt.strategy';
import { DeleteUserService } from '../services/delete.user.service';

@Controller('users/:id')
export class DeleteUserController {
  constructor(private readonly deleteUser: DeleteUserService) {}

  @Delete()
  async delete(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.deleteUser.execute(user.tenantId, id);
  }
}
