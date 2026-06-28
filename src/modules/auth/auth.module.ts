import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { EnvModule } from '@/infrastructure/env/env.module';
import { EnvService } from '@/infrastructure/env/env.service';
import { TenantContract } from '@/modules/tenants/repositories/tenant.contract';
import { TenantRepository } from '@/modules/tenants/repositories/tenant.repository';
import { UserContract } from '../users/repositories/user.contract';
import { UserRepository } from '../users/repositories/user.repository';
import { AuthController } from './http/auth.controller';
import { JwtAuthGuard } from './infrastructure/jwt/jwt.auth.guard';
import { JwtStrategy } from './infrastructure/jwt/jwt.strategy';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      global: true,
      useFactory(env: EnvService) {
        return {
          secret: env.get('JWT_SECRET'),
          signOptions: { expiresIn: '1d' },
        };
      },
    }),
  ],
  providers: [
    JwtStrategy,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: UserContract,
      useClass: UserRepository,
    },
    {
      provide: TenantContract,
      useClass: TenantRepository,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
