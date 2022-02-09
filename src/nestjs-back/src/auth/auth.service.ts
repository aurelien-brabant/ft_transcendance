import { Injectable } from '@nestjs/common';
import {UsersService} from 'src/users/users.service';
import { compare as comparePassword } from 'bcrypt';
import {Users} from 'src/users/entities/users.entity';
import {JwtService} from '@nestjs/jwt';
import fetch from 'node-fetch';
import * as FormData from 'form-data';
import {downloadResource} from 'src/utils/download';

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

  async loginDuoQuadra(apiCode: string): Promise<string | null> {
    const tokenEndpoint = 'https://api.intra.42.fr/oauth/token/';
    const formData = new FormData();

    formData.append('grant_type', 'authorization_code');
    formData.append('client_id', process.env.FT_CLIENT_ID);
    formData.append('client_secret', process.env.FT_SECRET);
    formData.append('code', apiCode);
    formData.append('redirect_uri', 'http://localhost/validate-fortytwo');

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

    const { access_token: ft_access_token, refresh_token: ft_refresh_token } = await res.json();

    const duoQuadraProfile = await (await fetch('https://api.intra.42.fr/v2/me', {
      headers: {
        'Authorization': `Bearer ${ft_access_token}`
      }
    })).json();

    let duoQuadraUser = await this.usersServices.findOneByDuoQuadraLogin(duoQuadraProfile.login);

    // first login using 42 credentials, creating a ft_transcendance account
    if (!duoQuadraUser) {

      duoQuadraUser = await this.usersServices.createDuoQuadra({
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
