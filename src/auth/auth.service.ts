import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { HASH_ROUNDS, JWT_SECRET } from './const/auth.const';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  signToken(user: Pick<UsersModel, 'id' | 'email'>, isRefreshToken = false) {
    const payload = {
      sub: user.id,
      email: user.email,
      type: isRefreshToken ? 'refresh' : 'access',
    };
    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: isRefreshToken ? 180 : 30,
    });
  }

  loginToken(user: Pick<UsersModel, 'id' | 'email'>) {
    return {
      accessToken: this.signToken(user),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticateUserWithEmail(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    const existingUser = await this.usersService.getUserByEmail(user.email);
    if (!existingUser) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }
    const isPasswordValid = await bcrypt.compare(
      user.password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }
    return existingUser;
  }

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.authenticateUserWithEmail(user);
    return this.loginToken(existingUser);
  }

  async registerWithEmail(
    user: Pick<UsersModel, 'email' | 'password' | 'nickname'>,
  ) {
    const hash = await bcrypt.hash(user.password, HASH_ROUNDS);
    const newUser = await this.usersService.createUser({
      ...user,
      password: hash,
    });
    return this.loginToken(newUser);
  }

  extractTokenFromHeader(header: string, isBearer: boolean) {
    const splitToken = header.split(' ');
    const prefix = isBearer ? 'Bearer' : 'Basic';
    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('잘못된 토큰입니다!');
    }
    const token = splitToken[1];
    return token;
  }

  decodeBasicToken(
    base64String: string,
  ): Pick<UsersModel, 'email' | 'password'> {
    const decoded = Buffer.from(base64String, 'base64').toString('utf8');

    const split = decoded.split(':');

    if (split.length !== 2) {
      throw new UnauthorizedException('잘못된 유형의 토큰입니다.');
    }

    const email = split[0];
    const password = split[1];

    return {
      email,
      password,
    };
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: JWT_SECRET,
      });
    } catch (e) {
      throw new UnauthorizedException('토큰이 만료됐거나 잘못된 토큰입니다.');
    }
  }

  rotateToken(token: string, isRefreshToken: boolean) {
    const decoded = this.jwtService.verify(token, {
      secret: JWT_SECRET,
    });

    /**
     * sub: id
     * email: email,
     * type: 'access' | 'refresh'
     */
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException(
        '토큰 재발급은 Refresh 토큰으로만 가능합니다!',
      );
    }

    return this.signToken(
      {
        ...decoded,
      },
      isRefreshToken,
    );
  }
}