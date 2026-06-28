import { Module } from '@nestjs/common';
import { TenantContract } from '../tenants/repositories/tenant.contract';
import { TenantRepository } from '../tenants/repositories/tenant.repository';
import { CreateUserController } from './http/create.user.controller';
import { DeleteUserController } from './http/delete.user.controller';
import { FindAllUsersController } from './http/find.all.users.controller';
import { FindUserByIdController } from './http/find.user.by.id.controller';
import { UserUpdateController } from './http/update.user.controller';
import { UserContract } from './repositories/user.contract';
import { UserRepository } from './repositories/user.repository';
import { CreateUserService } from './services/create.user.service';
import { DeleteUserService } from './services/delete.user.service';
import { FindAllUsersService } from './services/find.all.users.service';
import { FindUserByIdService } from './services/find.users.by.id.service';
import { UpdateUserService } from './services/update.user.service';

@Module({
  controllers: [
    CreateUserController,
    FindAllUsersController,
    FindUserByIdController,
    UserUpdateController,
    DeleteUserController,
  ],
  providers: [
    CreateUserService,
    FindAllUsersService,
    FindUserByIdService,
    UpdateUserService,
    DeleteUserService,
    {
      provide: UserContract,
      useClass: UserRepository,
    },
    {
      provide: TenantContract,
      useClass: TenantRepository,
    },
  ],
})
export class UserModule {}
