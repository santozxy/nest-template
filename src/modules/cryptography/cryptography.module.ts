import { Encrypter } from '@/modules/cryptography/repositories/encrypter.contract';
import { HashComparer } from '@/modules/cryptography/repositories/hash.compare.contract';
import { HashGenerator } from '@/modules/cryptography/repositories/hash.generator.contract';
import { BcryptHasher } from '@/modules/cryptography/services/bcrypt.hasher';
import { JwtEncrypter } from '@/modules/cryptography/services/jwt.encrypter';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [
    { provide: Encrypter, useClass: JwtEncrypter },
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
  ],
  exports: [Encrypter, HashComparer, HashGenerator],
})
export class CryptographyModule {}
