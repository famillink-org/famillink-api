import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../core/decorators/roles.decorator';
import { ERole } from '../../../core/data/user/entities/enum-role';
import { UserEntity } from '../../../core/data/user/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ERole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const user: UserEntity | undefined = context.switchToHttp().getRequest();

    // Vérifier si l'utilisateur a le rôle SuperAdmin (qui a toutes les permissions)
    if (user?.role === ERole.SuperAdmin) {
      return true;
    }

    return requiredRoles.some((role) => user?.role === role);
  }
}
