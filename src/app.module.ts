import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { envSchema } from './infrastructure/env/env';
import { AuthModule } from './modules/auth/auth.module';
import { CryptographyModule } from './modules/cryptography/cryptography.module';
import { TenantModule } from './modules/tenants/tenant.module';
import { UserModule } from './modules/users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) =>
        envSchema.parse(env) as unknown as Record<string, string>,
      isGlobal: true,
    }),
    PrismaModule,
    CryptographyModule,
    TenantModule,
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
