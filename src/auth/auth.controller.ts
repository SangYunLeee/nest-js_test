import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModel } from 'src/users/entity/users.entity';
import { RefreshTokenGuard } from './guard/bearer-token.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import { IsPublic } from 'src/common/decorator/is-public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token/access')
  @IsPublic()
  @UseGuards(RefreshTokenGuard)
  postTokenAccess(@Req() req: { token: string }) {
    const newToken = this.authService.rotateToken(req.token, false);
    /**
     * {accessToken: {token}}
     */
    return {
      accessToken: newToken,
    };
  }

  @Post('token/refresh')
  @IsPublic()
  @UseGuards(RefreshTokenGuard)
  postTokenRefresh(@Req() req: { token: string }) {
    const newToken = this.authService.rotateToken(req.token, true);
    /**
     * {refreshToken: {token}}
     */
    return {
      refreshToken: newToken,
    };
  }

  @Post('login/email')
  @IsPublic()
  loginWithEmail(@Body() user: Pick<UsersModel, 'email' | 'password'>) {
    return this.authService.loginWithEmail(user);
  }

  @Post('register/email')
  @IsPublic()
  registerWithEmail(@Body() user: RegisterUserDto) {
    return this.authService.registerWithEmail(user);
  }
}
