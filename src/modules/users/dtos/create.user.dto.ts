import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'O tenantId é obrigatório.' })
  tenantId!: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  name!: string;

  @IsEmail({}, { message: 'O email deve ser válido.' })
  @IsNotEmpty({ message: 'O email é obrigatório.' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'O CPF é obrigatório.' })
  cpf!: string;

  @IsString()
  @IsNotEmpty({ message: 'O telefone é obrigatório.' })
  phone!: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  password!: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'O papel informado é inválido.' })
  role?: UserRole;
}
