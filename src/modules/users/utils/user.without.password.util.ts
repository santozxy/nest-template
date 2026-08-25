import { PublicUser, User } from '../entities/user.entity';

export function withoutUserPassword(user: User): PublicUser {
  const { password, ...publicUser } = user;

  void password;

  return publicUser;
}
