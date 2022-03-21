import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { SeedChannel, SeedGame, SeedMessage, SeedUser } from './seeder';
import { UsersService } from '../users/users.service';
import { GamesService } from '../games/games.service';
import { ChannelsService } from '../chat/channels/channels.service';
import { MessagesService } from '../chat/messages/messages.service';
import { faker } from '@faker-js/faker';

@Injectable()
export class SeederService {
    constructor(
        private readonly usersService: UsersService,
        private readonly gamesService: GamesService,
        private readonly channelsService: ChannelsService,
        private readonly messagesService: MessagesService
    ) {}

    async createFakeUser(username: string, i: number) {

        let user = await this.usersService.create({
        email: "test" + String(i) + "@gmail.com",
        password: "test",
        pic: null,
        games: [],
        wins: 0,
        losses: 0,
        friends: [],
        ownedChannels: [],
        joinedChannels: [],
        accountDeactivated: false,
        });
        user = await this.usersService.update(user.id.toString(), {
            username: username,
            phone: faker.phone.phoneNumber(),
            duoquadra_login: (i % 2) ? null : username + "_42",
            wins: faker.datatype.number(),
            blockedUsers: [],
            losses: faker.datatype.number()
        } as SeedUser);
        return user;
    }

    async seed() {
        await getConnection().synchronize(true);
        console.log('[+] Seeding fake users...');
        await this.seedFakeUsers();
        console.log('[+] Seeding fake games...');
        await this.seedFakeGames();
        console.log('[+] Seeding fake chat groups..');
        await this.seedFakeGroups();
        console.log('[+] Seeding fake DMs...');
        await this.seedFakeDMs();
    }

    async seedFakeUsers() {
        for (let i = 0; i <= 11; ++i) {
            let pseudo = faker.internet.userName();
            const user = await this.createFakeUser(pseudo, i);

            console.log('User [%s] => [%s] [%s] created', user.id, user.duoquadra_login, user.email);
        }
    }

    async seedFakeGames() {

        for (let i = 0; i < 10; ++i) {
            const winner = await this.usersService.findOne(String(i + 1));
            const looser = await this.usersService.findOne(String(i + 2));

            let game = await this.gamesService.create({
                createdAt: String(Date.now() + i),
            });
            game = await this.gamesService.update(game.id.toString(), {
                players: [winner, looser],
                winnerId: (i < 9) ? i + 1 : 1,
                looserId: (i < 8) ? i + 2 : 2,
                endedAt: String(Date.now() + i + 180),
                winnerScore: faker.datatype.number(),
                looserScore: faker.datatype.number(),
            } as SeedGame);

            console.log('Game [%s] created', game.id);
        }
    }

    async seedFakeMessages(dstChannel: SeedChannel, fakeSender: SeedUser, fakeFriend: SeedUser) {
        for (let i = 0; i < 10; ++i) {
            let message: SeedMessage;

            if (i % 2) {
                message = await this.messagesService.create({
                    createdAt: faker.datatype.datetime(),
                    content: `I am ${fakeSender.username}`,
                    author: fakeSender,
                    channel: dstChannel
                });
            } else {
                message = await this.messagesService.create({
                    createdAt: faker.datatype.datetime(),
                    content: `I am ${fakeFriend.username}`,
                    author: fakeFriend,
                    channel: dstChannel
                });
            }
            // console.log("Message [%s] => ['%s'] sent by User [%s]", message.id, message.content, message.author.id);
        }
    }

    async seedFakeGroups() {
        const fakeOwner = await this.usersService.findOne('1');
        const fakeFriend = await this.usersService.findOne('2');
        const randomUser = await this.usersService.findOne('3');

        for (let i = 0; i < 10; ++i) {
            let channel = await this.channelsService.create({
                name: 'fakeChannel_' + i,
                owner: fakeOwner,
                privacy: ['private', 'public', 'protected'][Math.floor(Math.random() * 3)],
                users: [fakeOwner, fakeFriend, randomUser],
                messages: []
            } as SeedChannel);
            if (channel.privacy === 'protected') {
                channel = await this.channelsService.update(channel.id.toString(), {
                    password: 'test'
                });
            }

            console.log('[+] Seeding fake messages in channel [%s]...', channel.id);
            await this.seedFakeMessages(channel, fakeOwner, fakeFriend);
        }
    }

    async seedFakeDMs() {
        const fakeOwner = await this.usersService.findOne('1');

        for (let i = 2; i < 11; ++i) {
            const fakeFriend = await this.usersService.findOne(i.toString())
            let channel = await this.channelsService.create({
                name: 'fakeDM_' + i,
                owner: fakeOwner,
                privacy: 'private',
                users: [fakeOwner, fakeFriend],
                messages: []
            } as SeedChannel);

            console.log('[+] Seeding fake messages in channel [%s]...', channel.id);
            await this.seedFakeMessages(channel, fakeOwner, fakeFriend);
        }
    }
}
