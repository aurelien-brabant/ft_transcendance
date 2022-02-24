import { Injectable } from '@nestjs/common';
import { getConnection, getRepository } from 'typeorm';
import { Users } from 'src/users/entities/users.entity';
import { UsersService } from '../users/users.service';
import { GamesService } from '../games/games.service';
import { ChannelsService } from '../channels/channels.service';
import { MessagesService } from '../messages/messages.service';
import { faker } from '@faker-js/faker';

type SeedChannels = {
    id: number;
    name: string;
    owner: Users;
    isPublic: boolean;
    isProtected: boolean;
    password: string;
    users: Users[];
    messages: SeedMessages[];
};

type SeedMessages = {
    id: number;
    createdAt: Date;
    content: string;
    sender: Users;
    channel: SeedChannels;
};

@Injectable()
export class SeederService {
    constructor(
        private readonly usersService: UsersService,
        private readonly gamesService: GamesService,
        private readonly channelsService: ChannelsService,
        private readonly messagesService: MessagesService
    ) {}

    async createFakeUser(username: string) {
        const user = await this.usersService.seed({
            email: (faker.unique as any)(faker.internet.email),
            username: username,
            password: faker.internet.password(),
            rank: faker.datatype.number(),
            win: faker.datatype.number(),
            loose: faker.datatype.number(),
            phone: faker.phone.phoneNumber(),
            pic: faker.image.imageUrl(),
            duoquadra_login: username + "_42",
            games: [],
            friends: [],
            ownedChannels: [],
            joinedChannels: [],
            sentMessages: []
        });
        return user;
    }

    async seed() {
        await getConnection().synchronize(true);
        console.log('[+] Seeding fake users...');
        await this.seedFakeUsers();
        console.log('[+] Seeding fake games...');
        await this.seedFakeGames();
        console.log('[+] Seeding fake channels...');
        await this.seedFakeChannels();
    }

    async seedFakeUsers() {
        for (let i = 0; i < 100; ++i) {
            let pseudo = faker.internet.userName();
            const user = await this.usersService.seed({
                email: (faker.unique as any)(faker.internet.email),
                username: pseudo,
                password: faker.internet.password(),
                rank: faker.datatype.number(),
                win: faker.datatype.number(),
                loose: faker.datatype.number(),
                phone: faker.phone.phoneNumber(),
                pic: faker.image.imageUrl(),
                duoquadra_login: pseudo + "_42",
                games: [],
                friends: [],
                ownedChannels: [],
                joinedChannels: [],
                sentMessages: []
            });

            console.log("User [%s] => [%s] [%s] created", user.id, user.duoquadra_login, user.email);
        }
    }

    async seedFakeGames() {
        for (let i = 0; i < 100; ++i) {
            //let pseudo = faker.internet.userName();
            const game = await this.gamesService.seed({
                createdAt: faker.datatype.datetime(),
                players: [],
                winner: 12,
                /* winner: {
                    id: 1,
                    email: faker.unique(faker.internet.email),
                    username: pseudo,
                    password: faker.internet.password(),
                    rank: faker.datatype.number(),
                    phone: faker.phone.phoneNumber(),
                    pic: faker.image.imageUrl(),
                    duoquadra_login: pseudo + "_42",
                    games: [],
                    friends: [],
                    win: 12,
                    gameInviteSender: [],
                    gameInviteReceiver: [],
                } */
            });

            console.log("Game [%s] created", game.id);
        }
    }

    async seedFakeMessages(dstChannel: SeedChannels, fakeSender: Users) {
        for (let i = 0; i < 10; ++i) {
            const message = await this.messagesService.create({
                createdAt: faker.datatype.datetime(),
                content: faker.lorem.sentence(5),
                sender: fakeSender,
                channel: dstChannel
            } as SeedMessages);

            console.log("Message [%s] => ['%s'] sent by User [%s]", message.id, message.content, message.sender.id);
        }
    }

    async seedFakeChannels() {
        const fakeOwner = await this.createFakeUser("fakeOwner");

        for (let i = 0; i < 100; ++i) {
            const channel = await this.channelsService.create({
                name: (faker.unique as any)(faker.company.companyName),
                owner: fakeOwner,
                isPublic: true,
                isProtected: false,
                password: faker.internet.password(),
                users: [fakeOwner],
                messages: []
            } as SeedChannels);

            console.log('[+] Seeding fake messages in channel [%s]...', channel.id);
            await this.seedFakeMessages(channel, fakeOwner);
        }
    }
}
