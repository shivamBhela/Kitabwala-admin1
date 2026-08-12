import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { Permission, roleHasPermission } from '../../modules/auth/rbac/permissions';
import type { AuthenticatedUser } from '../../modules/auth/jwt-payload.type';

@Injectable()
export class PermissionsGuard {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const required = this.reflector.getAllAndOverride<Permission | undefined>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true; // route only requires authentication, no specific permission

    const user = context.switchToHttp().getRequest().user as AuthenticatedUser | undefined;
    if (!roleHasPermission(user?.adminRole, required)) {
      throw new ForbiddenException(`Missing required permission: ${required}`);
    }
    return true;
  }
}
