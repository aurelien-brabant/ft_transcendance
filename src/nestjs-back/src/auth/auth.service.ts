import { Injectable } from '@nestjs/common';
import { compare as comparePassword } from 'bcrypt';
import { User } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import fetch from 'node-fetch';
import * as FormData from 'form-data';

export interface CustomSocket extends Socket { 
  user: User;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {

    const user = await this.usersService.findUserPassword(email);

    if (user && await comparePassword(password, user.password)) {
      const { password, ...result } = user; // exclude password from result
      return result;
    }

    return null;
  };

  async generateJWT(user: User) {
    const payload = { sub: user.id };

    return {
      access_token: this.jwtService.sign(payload)
    };
  }

  async loginDuoQuadra(apiCode: string): Promise<string | null> {
    const tokenEndpoint = 'https://api.intra.42.fr/oauth/token/';
    const formData = new FormData();

    formData.append('grant_type', 'authorization_code');
    formData.append('client_id', process.env.FT_CLIENT_ID);
    formData.append('client_secret', process.env.FT_SECRET);
    formData.append('code', apiCode);
    formData.append('redirect_uri', process.env.FT_REDIRECT_URI);

    const res = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        ...formData.getHeaders()
      },
      body: formData.getBuffer().toString()
    });

    console.log(res.status);

    if (res.status != 200) {
      console.log(await res.json());
      return null;
    }

    // refresh_token not used yet (don't have any plan to use it, to be removed one day then...)
    const { access_token: ft_access_token, refresh_token: ft_refresh_token } = await res.json();

    const duoQuadraProfile = await (await fetch('https://api.intra.42.fr/v2/me', {
      headers: {
        'Authorization': `Bearer ${ft_access_token}`
      }
    })).json();

    let duoQuadraUser = await this.usersService.findOneByDuoQuadraLogin(duoQuadraProfile.login);

    // first login using 42 credentials, creating a ft_transcendance account
    if (!duoQuadraUser) {

      duoQuadraUser = await this.usersService.createDuoQuadra({
        phone: duoQuadraProfile.phone !== 'hidden' ? duoQuadraUser.phone : null,
        email: duoQuadraProfile.email,
        imageUrl: duoQuadraProfile.image_url,
        login: duoQuadraProfile.login,
      }, ft_access_token);

      console.log(duoQuadraUser);
    } else {
      console.log('Existing duoquadra', duoQuadraUser);
    }

    return this.jwtService.sign({ sub: ''+duoQuadraUser.id });
  }
}
