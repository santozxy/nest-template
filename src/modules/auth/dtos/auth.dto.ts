import { IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @IsString()
  @IsNotEmpty({ message: 'O slug do tenant é obrigatório.' })
  tenantSlug!: string;

  @IsString()
  @IsNotEmpty({ message: 'O CPF é obrigatório.' })
  cpf!: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  password!: string;
}
