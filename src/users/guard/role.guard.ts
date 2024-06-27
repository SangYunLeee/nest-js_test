import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorator/role.decorator';
import { RolesEnum } from '../const/roles.const';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRole: RolesEnum = this.reflector.getAllAndOverride(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRole) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (requiredRole !== user.role) {
      throw new ForbiddenException(
        `${user.role} role is not allowed to access this resource. Required role is ${requiredRole}`,
      );
    }
    return true;
  }
}
