import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entities/users.entity';
import { CreateDuoQuadraDto } from './dto/create-duoquadra.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hash as hashPassword } from 'bcrypt';
import { prefixWithRandomAdjective } from 'src/utils/prefixWithRandomAdjective';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { downloadResource } from 'src/utils/download';
import { join } from 'path';
import { readFileSync } from 'fs';
import { faker } from '@faker-js/faker';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
    //    @InjectRepository(Games)
        //private readonly gamesRepository: Repository<Games>,
    ) {}

    findAll(paginationQuery: PaginationQueryDto) {
        const {offset, limit} = paginationQuery;
        return this.usersRepository.find({
            relations: ['games', 'friends'],
            skip: offset,
            take: limit,
        });
    }

    async findOneByEmail(email: string): Promise<Users> | null {
        const user = await this.usersRepository.findOne({ email });

        return user;
    }

    async findOneByDuoQuadraLogin(login: string): Promise<Users> | null {
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

    async getWinCount(id: string) {
        const user = await this.usersRepository
            .createQueryBuilder("user")
            .innerJoinAndSelect("user.wins", "game")
            .where("user.id = :id", { id: id })
            .getOne();

        if (!user)
            throw new NotFoundException(`User [${id}] not found`);
        return user.wins.length;
    }

    async getLossCount(id: string) {
        const user = await this.usersRepository.findOne(id);
        if (!user)
            throw new NotFoundException(`User [${id}] not found`);
        return user.losses;
    }

    async getFriends(id: string) {
        const user = await this.usersRepository.findOne(id);

        if (!user)
            throw new NotFoundException(`User [${id}] not found`);
        return user.friends;
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

    async getSentMessages(id: string) {
        const user = await this.usersRepository
            .createQueryBuilder("user")
            .innerJoinAndSelect("user.sentMessages", "message")
            .where("user.id = :id", { id: id })
            .getOne();

        if (!user)
            throw new NotFoundException(`User [${id}] not found`);
        return user.sentMessages;
    }

    async createDuoQuadra({
        email,
        phone,
        imageUrl,
        login,
    }: CreateDuoQuadraDto, ftBearer: string): Promise<Users> {
        // we need to generate an username for the duoquadra. However, we can't guarantee that another user
        // isn't using the duoquadra's login as username currently. Thus we need to check for that possiblity and
        // generate a random prefix in case the login is already taken.

        let actualLogin = login;
        let u: Users | null = null;

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
            duoquadra_login: login,
        });

        return this.usersRepository.save(user);
    }

    async create(createUserDto: CreateUserDto) {
    /*    const games = await Promise.all(
          createUserDto.games.map(name => this.preloadGameByName(name)),
        );
*/
        let u: Users | null = null;

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
/*                const games = 
            updateUserDto.games &&
            (await Promise.all(
                updateUserDto.games.map(name => this.preloadGameByName(name)),
            ));
*/
         const user = await this.usersRepository.preload({
            id: +id,
            ...updateUserDto,
//                      games,
        });
        if (!user)
            throw new NotFoundException(`Cannot update user[${id}]: Not found`);
        return this.usersRepository.save(user);
    }

    async remove(id: string) {
        const user = await this.findOne(id);
        return this.usersRepository.remove(user);
    }
/*
    private async preloadGameByName(name: string): Promise<Games> {
        const existingGame = await this.gamesRepository.findOne({ name });
        if (existingGame)
            return existingGame;
        return this.gamesRepository.create({ name });
    }

  */
}
