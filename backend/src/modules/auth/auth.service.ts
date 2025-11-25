import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import { Response } from 'express';
import { User } from '../../../generated/prisma/client';
import { DateTimeUtil } from '../../utils/date-time-util';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';

export type OAuthUser = {
  email: string;
  name: string;
  picture: string;
};

export type JwtTokens = {
  userId: string;
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

  async validateUserLogin({ email, password }: LoginDto): Promise<User> {
    const user = await this.userService.findByEmail(email);

    if (!user) throw new NotFoundException('User not found');

    if (!user.password) throw new BadRequestException('User has no local credentials');

    if (!(await verify(user.password, password)))
      throw new BadRequestException('Invalid credentials');

    return user;
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

  async verifyUserRefreshToken(refreshToken: string, userId: string): Promise<User> {
    const user = await this.userService.findById(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException();
    }

    const refreshTokenMatches = await verify(user.refreshToken, refreshToken);
    if (!refreshTokenMatches) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async login(res: Response, userId: string) {
    const tokens = this.generateJwt(userId);

    await this.userService.updateRefreshToken(userId, await hash(tokens.refreshToken));

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      maxAge: DateTimeUtil.DAY * 30,
      sameSite: 'lax',
      secure: this.configService.getOrThrow('NODE_ENV') === 'production',
      path: '/auth/refresh',
    });

    return tokens;
  }

  private generateJwt(userId: string): JwtTokens {
    const payload = { sub: userId };
    return {
      userId,
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '7d',
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      }),
    };
  }
}
