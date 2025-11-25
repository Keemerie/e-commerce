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
    const user = await this.authService.validateUserLogin(dto);

    const { accessToken } = await this.authService.login(res, user.id);

    return new AuthResponseDto(accessToken);
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@UserDecorator() user: User, @Res() res: Response) {
    await this.authService.login(res, user.id);

    return res.redirect(this.configService.getOrThrow('CLIENT_URL'));
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refreshTokens(@UserDecorator() user: User, @Res({ passthrough: true }) res: Response) {
    const { accessToken } = await this.authService.login(res, user.id);

    return new AuthResponseDto(accessToken);
  }
}
