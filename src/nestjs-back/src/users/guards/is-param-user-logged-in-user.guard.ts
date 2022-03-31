import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';

const validateRequest = async (request: any): Promise<boolean> => {
  const {
    params: { userId: paramUserId },
    user: { id: loggedUserId },
  } = request;

  if (typeof paramUserId !== 'string') {
    return false;
  }

  return paramUserId == loggedUserId;
};

@Injectable()
export class IsParamUserLoggedInUserGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return validateRequest(request);
  }
}
