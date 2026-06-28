import * as bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hash(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

export async function compare(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  const result = await bcrypt.compare(password, hashedPassword);
  return result;
}
