import { Injectable } from '@nestjs/common';
import { getConnection, Repository } from 'typeorm';
import { SeedChannel, SeedGame, SeedMessage, SeedUser } from './seeder';
import { UsersService } from '../users/users.service';
import { GamesService } from '../games/games.service';
import { ChannelsService } from '../chat/channels/channels.service';
import { MessagesService } from '../chat/messages/messages.service';
import { faker } from '@faker-js/faker';
import { AchievementsService } from 'src/achievements/achievements.service';
import achievementList from 'src/constants/achievementsList';

@Injectable()
export class SeederService {
    constructor(
        private readonly usersService: UsersService,
        private readonly gamesService: GamesService,
        private readonly channelsService: ChannelsService,
        private readonly messagesService: MessagesService,
        private readonly achievementsService: AchievementsService,
     ) {}

    async createAchievements() {

        const list = achievementList;
        for (let i = 0; i < list.length; i++) {
            const achievement = this.achievementsService.create(list[i]);
            (achievement) && console.log("Achievement [%s] created =>s", list[i].type, list[i].description);
        }
    } 

    async createFakeUser(username: string, i: number) {

        let user = await this.usersService.create({
            email: "test" + String(i) + "@gmail.com",
            password: "test",
            pic: null,
            accountDeactivated: false,
            games: [],
            wins: 0,
            losses: 0,
            draws: 0,
            friends: [],
            blockedUsers: [],
            pendingFriendsSent: [],
            pendingFriendsReceived: [],
            ownedChannels: [],
            joinedChannels: [],
        });
        user = await this.usersService.update(user.id.toString(), {
            username: username,
            phone: faker.phone.phoneNumber(),
            duoquadra_login: (i % 2) ? null : username + "_42",
            wins: faker.datatype.number(),
            losses: faker.datatype.number(),
        } as SeedUser);
        return user;
    }

    async updateFakeUser(i: number) {
        let user = await this.usersService.update(String(i + 1), {
            friends: [
                {
                    "id": i === 2 ? 3 : 2,
                },
                {
                    "id": i === 5 ? 4 : 5,
                }
            ]
        } as SeedUser);
        user = await this.usersService.update(String(i + 1), {
            blockedUsers: [
                {
                    "id": i === 6 ? 7 : 6,
                },
                {
                    "id": i === 8 ? 8 : 9,
                }
            ]
        } as SeedUser);
        return user;
    }

    async seed() {
        await getConnection().synchronize(true);
        console.log('[+] Creating achievements database...');
        await this.createAchievements();
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
        for (let i = 0; i <=10; ++i) {
            const user = await this.updateFakeUser(i);

            console.log("User [%s] => [%s] [%s] updated", user.id, user.duoquadra_login, user.email);
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

    /* Chat messages */
    async seedFakeMessages(dstChannel: SeedChannel, fakeSender: SeedUser, fakeFriend: SeedUser) {
        for (let i = 0; i < 5; ++i) {
            if (i % 2) {
                await this.messagesService.create({
                    content: `I am ${fakeSender.username}`,
                    author: fakeSender,
                    channel: dstChannel
                });
            } else {
                await this.messagesService.create({
                    content: `I am ${fakeFriend.username}`,
                    author: fakeFriend,
                    channel: dstChannel
                });
            }
        }
    }

    /* Test for a chat group with one blocked user */
    async seedBlockedUserGroup() {
        const fakeOwner = await this.usersService.findOne('1');
        const fakeFriend = await this.usersService.findOne('2');
        const fakeBlocked = await this.usersService.findOne('6');

        const channel = await this.channelsService.create({
                name: 'block test',
                owner: fakeOwner,
                privacy: 'private',
                users: [ { "id": 1 }, { "id": 2 }, { "id": 6 } ],
                messages: [],
            } as SeedChannel);

        await this.seedFakeMessages(channel, fakeOwner, fakeFriend);
        await this.messagesService.create({
            content: `I am ${fakeBlocked.username} and should be blocked`,
            author: fakeBlocked,
            channel: channel
        });
    }

    async seedFakeGroups() {
        const fakeOwner = await this.usersService.findOne('1');
        const fakeFriend = await this.usersService.findOne('2');

        for (let i = 0; i < 5; ++i) {
            let channel = await this.channelsService.create({
                name: 'fakeChannel_' + i,
                owner: fakeOwner,
                privacy: ['private', 'public', 'protected'][Math.floor(Math.random() * 3)],
                users: [ { "id": 1 }, { "id": 2 }, { "id": 3 } ],
                messages: [],
            } as SeedChannel);
            if (channel.privacy === 'protected') {
                channel = await this.channelsService.update(channel.id.toString(), {
                    password: 'test' + i
                });
            }
            channel = await this.channelsService.update(channel.id.toString(), {
                admins: [fakeFriend]
            });

            console.log('[+] Seeding fake messages in channel [%s]...', channel.id);
            await this.seedFakeMessages(channel, fakeOwner, fakeFriend);
        }
        await this.seedBlockedUserGroup();
    }

    async seedFakeDMs() {
        const fakeOwner = await this.usersService.findOne('1');

        for (let i = 2; i < 11; ++i) {
            const fakeFriend = await this.usersService.findOne(i.toString())
            let channel = await this.channelsService.create({
                name: 'fakeDM_' + i,
                owner: fakeOwner,
                privacy: 'dm',
                users: [fakeOwner, fakeFriend],
                messages: []
            } as SeedChannel);

            console.log('[+] Seeding fake messages in channel [%s]...', channel.id);
            await this.seedFakeMessages(channel, fakeOwner, fakeFriend);
        }
    }
}
