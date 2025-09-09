import { UserRole } from '@/users/enums/user-role.enum';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user || user.userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('접근할 수 없는 권한입니다.');
    }

    return true;
  }
}
