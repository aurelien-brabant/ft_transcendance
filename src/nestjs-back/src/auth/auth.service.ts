import {Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';
import {compare as comparePassword} from 'bcryptjs';
import fetch from 'node-fetch';
import * as FormData from 'form-data';
import { User } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {
    }

    async validateUser(email: string, password: string): Promise<any> {

        const user = await this.usersService.findUserPassword(email);

        if (user && await comparePassword(password, user.password)) {

            const u = await this.usersService.findOneByEmail(email);
            if (!u)
                return null;

            return u;
        }
        return null;
    };

    async getCookieWithJwtToken(userId: number) {
        const payload = {sub: userId};
        const token = this.jwtService.sign(payload);

        return `Authentication=${token}; HttpOnly; Path=/;`;
        /*
            return {
              access_token: this.jwtService.sign(payload),
            };
            */
    }

    async getLogOutCookie() {
        return `Authentication=; HttpOnly; Path=/;`;
    }

    async loginDuoQuadra(apiCode: string): Promise<User | null> {
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
                ...formData.getHeaders(),
            },
            body: formData.getBuffer().toString(),
        });

        console.log(res.status);

        if (res.status != 200) {
            console.log(await res.json());
            return null;
        }

        // refresh_token not used yet (don't have any plan to use it, to be removed one day then...)
        const {access_token: ft_access_token, refresh_token: ft_refresh_token} =
            await res.json();

        const duoQuadraProfile = await (
            await fetch('https://api.intra.42.fr/v2/me', {
                headers: {
                    Authorization: `Bearer ${ft_access_token}`,
                },
            })
        ).json();

        let duoQuadraUser = await this.usersService.findOneByDuoQuadraLogin(
            duoQuadraProfile.login,
        );

        // first login using 42 credentials, creating a ft_transcendance account
        if (!duoQuadraUser) {
            duoQuadraUser = await this.usersService.createDuoQuadra(
                {
                    email: duoQuadraProfile.email,
                    imageUrl: duoQuadraProfile.image_url,
                    login: duoQuadraProfile.login,
                },
                ft_access_token,
            );
            
            await this.usersService.getAvatar42(''+duoQuadraUser.id)
        } else {
            console.log('Existing duoquadra', duoQuadraUser);
        }

        return duoQuadraUser;
    }
}
