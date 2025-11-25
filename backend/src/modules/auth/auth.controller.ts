import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleOauthGuard } from './guards/google.guard';
import { Response } from 'express';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserDecorator } from '../../decorators/user.decorator';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh.guard';
import { LoginDto } from './dto/login.dto';
import { User } from '../../../generated/prisma/client';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.validateUserLogin(dto);

    this.authService.setRefreshToken(res, refreshToken);

    return new AuthResponseDto(accessToken);
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  googleAuthCallback(@UserDecorator() user: User, @Res() res: Response) {
    const { refreshToken } = this.authService.generateJwt(user.id);

    this.authService.setRefreshToken(res, refreshToken);

    return res.redirect(this.configService.get('CLIENT_URL')!);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  refreshTokens(@UserDecorator() user: User, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = this.authService.generateJwt(user.id);

    this.authService.setRefreshToken(res, refreshToken);

    return new AuthResponseDto(accessToken);
  }
}
