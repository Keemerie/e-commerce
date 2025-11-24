import { Expose } from 'class-transformer';
import { User } from '../../../../generated/prisma/client';
import { Nullable } from '../../../custom';

// TODO DOCS
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  avatar: string;

  constructor(user: Nullable<User>) {
    if (user) {
      Object.assign(this, user);
    }
  }
}
