import { HashComparer } from '@/modules/cryptography/repositories/hash.compare.contract';
import { HashGenerator } from '@/modules/cryptography/repositories/hash.generator.contract';
import { compare, hash } from 'bcryptjs';

export class BcryptHasher implements HashGenerator, HashComparer {
  private HASH_SALT_LENGTH = 8;

  hash(plain: string) {
    return hash(plain, this.HASH_SALT_LENGTH);
  }

  compare(plain: string, hash: string) {
    return compare(plain, hash);
  }
}
