import { Expose } from 'class-transformer';

export class AuthResponse {
  @Expose()
  accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }
}
