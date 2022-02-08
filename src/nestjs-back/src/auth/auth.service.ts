import { Injectable } from '@nestjs/common';
import {UsersService} from 'src/users/users.service';
import { compare as comparePassword } from 'bcrypt';
import {Users} from 'src/users/entities/users.entity';
import {JwtService} from '@nestjs/jwt';
import fetch from 'node-fetch';
import * as FormData from 'form-data';

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

  async loginDuoQuadra(apiCode: string): Promise<{ access_token: null }> {
    const tokenEndpoint = 'https://api.intra.42.fr/oauth/token/';
    const formData = new FormData();

    formData.append('grant_type', 'authorization_code');
    formData.append('client_id', process.env.FT_CLIENT_ID);
    formData.append('client_secret', process.env.FT_SECRET);
    formData.append('code', apiCode);
    formData.append('redirect_uri', 'http://localhost:3000/validate-fortytwo');

    const res = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        ...formData.getHeaders()
      },
      body: formData.getBuffer().toString()
    });

    console.log(res.status);

    if (res.status != 200) {
      return null;
    }

    const { access_token: ft_access_token, refresh_token: ft_refresh_token } = await res.json();

    const res2 = await fetch('https://api.intra.42.fr/v2/me', {
      headers: {
        'Authorization': `Bearer ${ft_access_token}`
      }
    });

    const login = (await res2.json()).login;

    let user42Id: number | null = null;

    const existingUser = await this.usersServices.findByDuoquadra(login);

    if (!existingUser) {
      // create user
      user42Id = newId;
    } else {
      user42Id = existingUser.id;
    }

    return {
      access_token: this.jwtService.sign({ sub: user42Id });
    };


  }

}
