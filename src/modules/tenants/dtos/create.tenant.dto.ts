import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do tenant é obrigatório.' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'O slug do tenant é obrigatório.' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'O slug deve conter apenas letras minúsculas, números e hífens.',
  })
  slug!: string;
}
