import {
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { GoogleOauthGuard } from './guards/google.guard';
import { Response } from 'express';
import { AuthResponse } from './dto/auth-response';
import { User } from '../../decorators/user.decorator';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@User() user, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = this.authService.generateJwt(user.id);

    this.authService.setRefreshToken(res, refreshToken);

    return new AuthResponse(accessToken);
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  googleAuthCallback(@User() user, @Res() res: Response) {
    const { refreshToken } = this.authService.generateJwt(user.id);

    this.authService.setRefreshToken(res, refreshToken);

    return res.redirect(process.env.CLIENT_URL!);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  refreshTokens(@User() user, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = this.authService.generateJwt(user.id);

    this.authService.setRefreshToken(res, refreshToken);

    return new AuthResponse(accessToken);
  }
}
