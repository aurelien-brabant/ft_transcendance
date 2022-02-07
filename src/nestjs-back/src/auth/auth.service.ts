import { Injectable } from '@nestjs/common';
import {UsersService} from 'src/users/users.service';
import { compare as comparePassword } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private usersServices: UsersService) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersServices.findOneByEmail(email);

    if (user && await comparePassword(password, user.password)) {
      const { password, ...result } = user; // exclude password from result
      return result;
    }

    return null;

  };
}
