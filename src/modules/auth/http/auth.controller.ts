import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '@/modules/auth/infrastructure/decorators/public.decorator';
import { AuthDto } from '../dtos/auth.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth/login')
@Public()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post()
  async login(@Body() body: AuthDto) {
    return this.auth.execute(body);
  }
}
