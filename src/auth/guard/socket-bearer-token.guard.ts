import { CanActivate, Injectable, UnauthorizedException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class SocketBearerTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}
  async canActivate(context: any): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const rawToken = client.handshake.headers['authorization'];
    try {
      if (!rawToken) {
        throw new UnauthorizedException('토큰이 없습니다!');
      }
      const token = this.authService.extractTokenFromHeader(rawToken, true);
      const paload = await this.authService.verifyToken(token);
      const user = await this.usersService.getUserByEmail(paload.email);
      client.user = user;
      client.token = token;
      client.tokenType = paload.type;
      return true;
    } catch (e: any) {
      throw new WsException(e.message);
    }
  }
}
