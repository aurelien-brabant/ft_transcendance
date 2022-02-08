import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { Friends } from 'src/friends/entities/friends.entity';
import { Games } from 'src/games/entities/games.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hash as hashPassword } from 'bcrypt';
import { CreateDuoQuadraDto } from './dto/create-duoquadra.dto';
import { faker } from '@faker-js/faker';
import { prefixWithRandomAdjective } from 'src/utils/prefixWithRandomAdjective';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        @InjectRepository(Games)
        private readonly gamesRepository: Repository<Games>,
        @InjectRepository(Friends)
        private readonly friendsRepository: Repository<Friends>,
    ) {}

    findAll() {
        return this.usersRepository.find({
            relations: ['games', 'friends'],
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

    async createDuoQuadra({
        email,
        phone,
        imageUrl,
        login,
    }: CreateDuoQuadraDto): Promise<Users> {
        // we need to generate an username for the duoquadra. However, we can't guarantee that another user
        // isn't using the duoquadra's login as username currently. Thus we need to check for that possiblity and
        // generate a random prefix in case the login is already taken.

        let actualLogin = login;
        let u: Users | null = null;

        do {
            actualLogin = prefixWithRandomAdjective(login, 50);
            u = await this.usersRepository.findOne({ username: actualLogin });
        } while (u);

        const user = this.usersRepository.create({
            username: actualLogin,
            email,
            phone,
            pic: imageUrl,
            duoquadra_login: login,
        });

        return this.usersRepository.save(user);
    }

    async create(createUserDto: CreateUserDto) {
        //const games = await Promise.all(
        //  createUserDto.games.map(id => this.preloadGameById(id)),
        //);

        // const friends = await Promise.all(
        // createUserDto.friends.map(id => this.preloadGameById(id)),
        // );
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

        const user = this.usersRepository.create({
            ...createUserDto,
            username,
            password: hashedPwd,
        });

        return this.usersRepository.save(user);
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        /*        const games = 
            updateUserDto.games &&
            (await Promise.all(
                updateUserDto.games.map(id => this.preloadGameById(id)),
            ));
*/
        /* const friends =
            updateUserDto.friends &&
            (await Promise.all(
                updateUserDto.friends.map(id => this.preloadGameById(id)),
            ));
*/
        const user = await this.usersRepository.preload({
            id: +id,
            ...updateUserDto,
            //          games,
            //          friends,
        });
        if (!user)
            throw new NotFoundException(`Cannot update user[${id}]: Not found`);
        return this.usersRepository.save(user);
    }

    async remove(id: string) {
        const user = await this.findOne(id);
        return this.usersRepository.remove(user);
    }

    private async preloadGameById(id: number): Promise<Games> {
        const existingGame = await this.gamesRepository.findOne({ id });
        if (existingGame) return existingGame;
        return this.gamesRepository.create({ id });
    }

    private async preloadFriendById(id: number): Promise<Friends> {
        const existingFriend = await this.friendsRepository.findOne({ id });
        if (existingFriend) return existingFriend;
        return this.friendsRepository.create({ id });
    }
}
