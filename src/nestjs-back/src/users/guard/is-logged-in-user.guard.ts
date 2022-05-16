import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from '../entities/users.entity';

@Injectable()
export class IsLoggedInUserGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const {
      params: { userId },
      user: loggedUser,
    } = context.switchToHttp().getRequest() as {
      params: { userId: string };
      user: User;
    };

    return userId === String(loggedUser.id);
  }
}
