import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
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
        private readonly usersRepository: Repository<User>
    ) {}

    findAll(paginationQuery: PaginationQueryDto) {
        const {offset, limit} = paginationQuery;
        return this.usersRepository.find({
            relations: ['games', 'friends', 'blockedUsers', 'pendingFriendsSent', 'pendingFriendsReceived'],
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
            relations: [
                'games',
                'friends',
                'blockedUsers',
                'pendingFriendsSent',
                'pendingFriendsReceived'
            ],
        });
        if (!user) throw new NotFoundException(`User [${id}] not found`);
        return user;
    }

    async getOwnedChannels(id: string) {
        const user = await this.usersRepository.findOne(id, {
            relations: ['ownedChannels'],
        });
        if (!user)
            throw new NotFoundException(`User [${id}] not found`);
        return user.ownedChannels;
    }

    async getJoinedChannels(id: string) {
        const user = await this.usersRepository.findOne(id, {
            relations: [
                'joinedChannels',
                'joinedChannels.owner',
                'joinedChannels.users',
                'joinedChannels.messages',
                'joinedChannels.messages.author'
            ],
        });
        if (!user)
            throw new NotFoundException(`User [${id}] joined no channels`);
        return user.joinedChannels;
    }

    async getDirectMessages(id: string, friendId: string) {
        const user = await this.usersRepository
            .createQueryBuilder('user')
            .innerJoinAndSelect('user.joinedChannels', 'channel')
            .innerJoinAndSelect('channel.users', 'users')
            .where('user.id = :id', { id })
            .andWhere('channel.privacy = :privacy', { privacy: 'dm' })
            .getOne();

        if (user) {
            const dms = user.joinedChannels;
            if (!friendId) {
                return dms;
            }
            var result = dms.filter(dm =>
                dm.users.find(user => {
                    return user.id.toString() === friendId
                })
            );
            if (result) {
                return result[0]; // bof
            }
        }
        throw new NotFoundException(`User [${id}] sent no DM`);
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
            u = await this.usersRepository.findOne({ username: username });
        } while (u);

        // hash the password with bcrypt using 10 salt rounds
        const hashedPwd = await hashPassword(createUserDto.password, 10);

        const imageLoc= join('/upload', 'avatars', username);

        await downloadResource(faker.image.nature(), imageLoc);

        const user = this.usersRepository.create({
            ...createUserDto,
            username,
            password: hashedPwd,
            pic: username
        });

        return this.usersRepository.save(user);
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        let user: User | null = null;
    
        if (updateUserDto.wins || updateUserDto.losses || updateUserDto.losses) {
            user = await this.usersRepository.findOne(id);
            const wins = updateUserDto.wins ? updateUserDto.wins : user.wins;
            const losses = updateUserDto.losses ? updateUserDto.losses : user.losses;
            const draws = updateUserDto.draws ? updateUserDto.draws : user.draws;
            const ratio = (Math.round((wins + (draws * .5)) / (wins + draws + losses) * 100) / 100)
    
            user = await this.usersRepository.preload({
                    id: +id,
                    ratio: ratio,
                    ...updateUserDto,
                });
        }
        else if (updateUserDto.friends) {
            user = await this.findOne(id);
            const oldFriends = (user.friends);
            
            let updated = [];
            for (let i in oldFriends)
                updated.push({id: oldFriends[i].id})
            for (let i in updateUserDto.friends)
                updated.push({id: updateUserDto.friends[i].id})
            
            user = await this.usersRepository.preload({
                id: +id,
                friends: updated,
            });
        }
        else if (updateUserDto.blockedUsers) {
            user = await this.findOne(id);
            const oldBlocked = (user.blockedUsers);
            
            let updated = [];
            for (let i in oldBlocked)
                updated.push({id: oldBlocked[i].id})
            for (let i in updateUserDto.blockedUsers)
                updated.push({id: updateUserDto.blockedUsers[i].id})
            
            user = await this.usersRepository.preload({
                id: +id,
                blockedUsers: updated,
            });
        }
        else if (updateUserDto.pendingFriendsReceived) {
            user = await this.findOne(id);
            const old = (user.pendingFriendsReceived);
            
            let updated = [];
            for (let i in old)
                updated.push({id: old[i].id})
            for (let i in updateUserDto.pendingFriendsReceived)
                updated.push({id: updateUserDto.pendingFriendsReceived[i].id})
            
            user = await this.usersRepository.preload({
                id: +id,
                pendingFriendsReceived: updated,
            });
        }
        else if (updateUserDto.pendingFriendsSent) {
            user = await this.findOne(id);
            const old = (user.pendingFriendsSent);
            
            let updated = [];
            for (let i in old)
                updated.push({id: old[i].id})
            for (let i in updateUserDto.pendingFriendsSent)
                updated.push({id: updateUserDto.pendingFriendsSent[i].id})
            
            user = await this.usersRepository.preload({
                id: +id,
                pendingFriendsSent: updated,
            });
        }
        else
            user = await this.usersRepository.preload({
                id: +id,
                ...updateUserDto,
            });

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
    
    async pipeQrCodeStream(stream: any, otpauthUrl: string) {
        return toFileStream(stream, otpauthUrl);
    }
    
    async isTfaCodeValid(tfaCode: string, user: User) {

        return authenticator.verify({
          token: tfaCode,
          secret: user.tfaSecret
        })
    }

    async uploadAvatar(id: string, filename: string) {
        await this.usersRepository.update(id, {
            pic: filename
        });

        return {upload: "success"};
    }

    async getRandomAvatar(id: string) {
        let user = await this.usersRepository.findOne(id);

        const imageLoc= join('/upload', 'avatars', user.pic);

        await downloadResource(faker.image.nature(), imageLoc);

        return {upload: "success"};
    }

    async getAvatar42(id: string) {
        let user = await this.usersRepository.findOne(id);

        const imageLoc= join('/upload', 'avatars', user.pic);

        await downloadResource(`https://cdn.intra.42.fr/users/${user.duoquadra_login}.jpg`, imageLoc);

        return {upload: "success"};
    }

    async removeRelation(id: string, userToUpdate: string, action: string) {
        let user = await this.findOne(id);
        if (!user)
            throw new NotFoundException(`Cannot update user[${id}]: Not found`);

        let oldList: any;
        if (action === 'friend')
            oldList = user.friends;
        else if (action === 'unblock')
            oldList = user.blockedUsers;
        else if (action === 'removeFriendsSent')
            oldList = user.pendingFriendsSent;
        else if (action === 'removeFriendsReceived')
            oldList = user.pendingFriendsReceived;
        let updated = [];
        for (let i in oldList) {
            if (String(oldList[i].id) !== userToUpdate)
                updated.push({id: oldList[i].id})
        }
        if (updated.length !== oldList.length && action === 'friend') {
            user = await this.usersRepository.preload({
                id: +id,
                friends: updated
            });
        }
        else if (updated.length !== oldList.length && action === 'unblock') {
            user = await this.usersRepository.preload({
                id: +id,
                blockedUsers: updated
            });
        }
        else if (updated.length !== oldList.length && action === 'removeFriendsSent') {
            user = await this.usersRepository.preload({
                id: +id,
                pendingFriendsSent: updated
            });
        }
        else if (updated.length !== oldList.length && action === 'removeFriendsReceived') {
            user = await this.usersRepository.preload({
                id: +id,
                pendingFriendsReceived: updated
            });
        }
        return this.usersRepository.save(user);
    }

    async updateStats(id: string, action: string) {
        let user = await this.findOne(id);
        if (!user)
            throw new NotFoundException(`Cannot update user[${id}]: Not found`);
 
       if (action === 'win') {
            const wins = user.wins + 1;
            const ratio = (Math.round((wins + (user.draws * .5)) / (wins + user.draws + user.losses) * 100) / 100)
            user = await this.usersRepository.preload({
                id: +id,
                wins: wins,
                ratio: ratio
            });
        }
        else if (action === 'loose') {
            const losses = user.losses + 1;
            const ratio = (Math.round((user.wins + (user.draws * .5)) / (user.wins + user.draws + losses) * 100) / 100)
            user = await this.usersRepository.preload({
                id: +id,
                losses: losses,
                ratio: ratio
            });
        }
        else  {
            const draws = user.draws + 1;
            const ratio = (Math.round((user.wins + (draws * .5)) / (user.wins + draws + user.losses) * 100) / 100)
            user = await this.usersRepository.preload({
                id: +id,
                draws: draws,
                ratio: ratio
            });
        }

        return this.usersRepository.save(user);
    }
}
