import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import { Response } from 'express';
import { User } from '../../../generated/prisma/client';
import { DateTimeUtil } from '../../utils/date-time-util';
import { SecuredUser, UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';

export type OAuthUser = {
  email: string;
  name: string;
  picture: string;
};

export type JwtTokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<SecuredUser> {
    const user = await this.userService.findByEmail(email);

    if (!user) throw new NotFoundException('User not found');

    if (!user.password) throw new BadRequestException('User has no local credentials');

    if (!(await verify(user.password, pass))) throw new BadRequestException('Invalid credentials');

    return this.userService.toPublicUser(user);
  }

  async validateOAuthLogin(user: OAuthUser): Promise<User> {
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }

    const existingUser = await this.userService.findByEmail(user.email);
    if (!existingUser) {
      return await this.userService.createUserViaOAuth(user);
    }

    return existingUser;
  }

  setRefreshToken(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: DateTimeUtil.DAY * 30,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/auth/refresh',
    });
  }

  generateJwt(userId: string): JwtTokens {
    const payload = { sub: userId };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '7d',
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      }),
    };
  }
}
