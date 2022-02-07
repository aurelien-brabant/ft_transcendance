import { Injectable } from '@nestjs/common';
import {UsersService} from 'src/users/users.service';
import { compare as comparePassword } from 'bcrypt';
import {Users} from 'src/users/entities/users.entity';
import {JwtService} from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private usersServices: UsersService, private readonly jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersServices.findOneByEmail(email);

    if (user && await comparePassword(password, user.password)) {
      const { password, ...result } = user; // exclude password from result
      return result;
    }

    return null;
  };

  async generateJWT(user: Users) {
    const payload = { sub: user.id };

    return {
      access_token: this.jwtService.sign(payload)
    };
  }
}
