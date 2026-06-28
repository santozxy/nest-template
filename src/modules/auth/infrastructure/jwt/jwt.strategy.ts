import { UnauthorizedException } from '@/common/domain/http.errors';
import { Env } from '@/infrastructure/env/env';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import z from 'zod';

export const tokenPayloadSchema = z.object({
  sub: z.string(),
  tenantId: z.string(),
  role: z.enum(['admin', 'member']),
});

export type UserPayload = z.infer<typeof tokenPayloadSchema>;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<Env, true>) {
    const secret = config.get('JWT_SECRET', { infer: true });

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  validate(payload: UserPayload): UserPayload {
    const result = tokenPayloadSchema.safeParse(payload);

    if (!result.success) {
      throw new UnauthorizedException('Token inválido.');
    }

    return result.data;
  }
}
