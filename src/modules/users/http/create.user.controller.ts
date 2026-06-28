import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Public } from '@/modules/auth/infrastructure/decorators/public.decorator';
import { CreateUserDto } from '../dtos/create.user.dto';
import { CreateUserService } from '../services/create.user.service';

@Controller('users')
@Public()
export class CreateUserController {
  constructor(private readonly createUser: CreateUserService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() body: CreateUserDto) {
    return this.createUser.execute(body);
  }
}
