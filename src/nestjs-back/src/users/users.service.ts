import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/users.entity';
import { CreateDuoQuadraDto } from './dto/create-duoquadra.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hash as hashPassword } from 'bcrypt';
import { prefixWithRandomAdjective } from 'src/utils/prefixWithRandomAdjective';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { downloadResource } from 'src/utils/download';
import { join } from 'path';
import { faker } from '@faker-js/faker';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    findAll(paginationQuery: PaginationQueryDto) {
        const {offset, limit} = paginationQuery;
        return this.usersRepository.find({
            relations: ['games', 'friends'],
            skip: offset,
            take: limit,
            order: {
                ratio: 'DESC'
            }
        });
    }

    async findUserPassword(email:string): Promise<User> | null {
    
        const user = await this.usersRepository
            .createQueryBuilder("user")
            .select("user.password")
            .where("user.email = :email", { email })
            .getOne();
console.log('user from findUserPwd', user);
        return user;
    }

    async findOneByEmail(email: string): Promise<User> | null {
        const user = await this.usersRepository.findOne({ email });
        return user;
    }

    async findOneByDuoQuadraLogin(login: string): Promise<User> | null {
        return this.usersRepository.findOne({
            duoquadra_login: login,
        });
    }

    async findOne(id: string) {
        const user = await this.usersRepository.findOne(id, {
            relations: ['games', 'friends'],
        });
        if (!user) throw new NotFoundException(`User [${id}] not found`);
        return user;
    }

    async getOwnedChannels(id: string) {
        const user = await this.usersRepository
            .createQueryBuilder("user")
            .innerJoinAndSelect("user.ownedChannels", "channel")
            .where("user.id = :id", { id: id })
            .getOne();

        if (!user)
            throw new NotFoundException(`User [${id}] not found`);
        return user.ownedChannels;
    }

    async getJoinedChannels(id: string) {
        const user = await this.usersRepository
            .createQueryBuilder("user")
            .innerJoinAndSelect("user.joinedChannels", "channel")
            .where("user.id = :id", { id: id })
            .getOne();

        if (!user)
            throw new NotFoundException(`User [${id}] not found`);
        return user.joinedChannels;
    }

    async createDuoQuadra({
        email,
        phone,
        login,
    }: CreateDuoQuadraDto, ftBearer: string): Promise<User> {
        // we need to generate an username for the duoquadra. However, we can't guarantee that another user
        // isn't using the duoquadra's login as username currently. Thus we need to check for that possiblity and
        // generate a random prefix in case the login is already taken.

        let actualLogin = login;
        let u: User | null = null;

        do {
            actualLogin = prefixWithRandomAdjective(login, 50);
            u = await this.usersRepository.findOne({ username: actualLogin });
        } while (u);

        const imageLoc= join('/upload', 'avatars', actualLogin);

        /* explictly fetch from CDN, since for some reason the API provides a private link lol */
        await downloadResource(`https://cdn.intra.42.fr/users/${login}.jpg`, imageLoc);

        const user = this.usersRepository.create({
            username: actualLogin,
            email,
            phone,
            pic: actualLogin,
            duoquadra_login: login,
        });

        return this.usersRepository.save(user);
    }

    async create(createUserDto: CreateUserDto) {
  
        let u: User | null = null;

        u = await this.usersRepository.findOne({
            email: createUserDto.email,
            duoquadra_login: null // we don't want to match duoquadras whatsoever
        });

        // user with that email already exists
        if (u) return null;

        // Generate a username based on the first part of the user's email address.
        const baseUsername = createUserDto.email.split('@')[0];
        let username = baseUsername;

        // repeats until the username is unique at this point in time
        do {
            username = prefixWithRandomAdjective(baseUsername, 50);
            u = await this.usersRepository.findOne({ username });
        } while (u);

        // hash the password with bcrypt using 10 salt rounds
        const hashedPwd = await hashPassword(createUserDto.password, 10);

        const randomPic = faker.image.nature();

        await downloadResource(randomPic, join('/upload', 'avatars', username));

        const user = this.usersRepository.create({
            ...createUserDto,
            username,
            password: hashedPwd,
        });

        return this.usersRepository.save(user);
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        let user: User | null = null;
        let ratio: number, winsTmp: number, lossesTmp: number;

        winsTmp = updateUserDto.wins ? updateUserDto.wins : null;
        lossesTmp = updateUserDto.losses ? updateUserDto.losses : null;

        if (winsTmp || lossesTmp) {
            user = await this.usersRepository.findOne(id);
            if (winsTmp && lossesTmp)
                ratio = (Math.round(winsTmp / lossesTmp * 100) / 100)
            else if (winsTmp && !lossesTmp)
                ratio = (Math.round(winsTmp / user.losses * 100) / 100)
            else if (lossesTmp && !winsTmp)
                ratio = (Math.round(user.wins / lossesTmp * 100) / 100)
            user = await this.usersRepository.preload({
                    id: +id,
                    ratio: ratio,
                    ...updateUserDto,
                });
        }
        else {
            user = await this.usersRepository.preload({
                id: +id,
                ...updateUserDto,
            });
        }

        if (!user)
            throw new NotFoundException(`Cannot update user[${id}]: Not found`);
        return this.usersRepository.save(user);
    }

    async remove(id: string) {
        const user = await this.findOne(id);
        return this.usersRepository.remove(user);
    }

    async findRrank(id: string, paginationQuery: PaginationQueryDto) {
        const users = await this.findAll(paginationQuery);
        let rank: string;

        for (let i = 0; i < users.length; i++) {
            if (String(users[i].id) === id)
                rank = String(i + 1);
        }
        return rank;
    }

    async setTfaSecret(secret: string, id: string) {
        return this.usersRepository.update(id, {
          tfaSecret: secret
        });
    }

    async enableTfa(id: string) {
        return this.usersRepository.update(id, {
          tfa: true
        });
    }

    async generateTfaSecret(user: User) {
        const secret = authenticator.generateSecret();
        const tfaAppName = "ft_transcendance";
     
        const otpauthUrl = authenticator.keyuri(user.email, tfaAppName, secret);
     
        await this.setTfaSecret(secret, String(user.id));
     
        return {
          secret,
          otpauthUrl
        }
      }
    
    public async pipeQrCodeStream(stream: any, otpauthUrl: string) {
        return toFileStream(stream, otpauthUrl);
    }
    
    public isTfaCodeValid(tfaCode: string, user: User) {

        return authenticator.verify({
          token: tfaCode,
          secret: user.tfaSecret
        })
    }
}
