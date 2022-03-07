import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { SeedChannel, SeedGame, SeedMessage, SeedUser } from './seeder';
import { UsersService } from '../users/users.service';
import { GamesService } from '../games/games.service';
import { ChannelsService } from '../channels/channels.service';
import { MessagesService } from '../messages/messages.service';
import { faker } from '@faker-js/faker';

@Injectable()
export class SeederService {
    constructor(
        private readonly usersService: UsersService,
        private readonly gamesService: GamesService,
        private readonly channelsService: ChannelsService,
        private readonly messagesService: MessagesService
    ) {}

    async createFakeUser(username: string) {
        let user = await this.usersService.create({
            email: (faker.unique as any)(faker.internet.email),
            password: faker.internet.password(),
            games: [],
            wins: [],
            losses: faker.datatype.number(),
            friends: [],
            ownedChannels: [],
            joinedChannels: []
        });
        user = await this.usersService.update(user.id.toString(), {
            username: username,
            phone: faker.phone.phoneNumber(),
            pic: faker.image.imageUrl(),
            duoquadra_login: username + "_42",
            rank: faker.datatype.number()
        } as SeedUser);
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
            const user = await this.createFakeUser(pseudo);

            console.log("User [%s] => [%s] [%s] created", user.id, user.duoquadra_login, user.email);
        }
    }

    async seedFakeGames() {
        const user = await this.usersService.findOne("12");

        for (let i = 0; i < 100; ++i) {
            let game = await this.gamesService.create({
                createdAt: faker.datatype.datetime(),
            });
            game = await this.gamesService.update(game.id.toString(), {
                players: [],
                winner: user
            } as SeedGame);

            console.log("Game [%s] created", game.id);
        }
    }

    async seedFakeMessages(dstChannel: SeedChannel, fakeSender: SeedUser) {
        for (let i = 0; i < 10; ++i) {
            const message = await this.messagesService.create({
                createdAt: faker.datatype.datetime(),
                content: faker.lorem.sentence(5),
                sender: fakeSender,
                channel: dstChannel
            } as SeedMessage);

            console.log("Message [%s] => ['%s'] sent by User [%s]", message.id, message.content, message.sender.id);
        }
    }

    async seedFakeChannels() {
        const fakeOwner = await this.createFakeUser("fakeOwner");

        for (let i = 0; i < 100; ++i) {
            const channel = await this.channelsService.create({
                name: (faker.unique as any)(faker.company.companyName),
                owner: fakeOwner,
                visibility: "protected",
                password: faker.internet.password(),
                users: [fakeOwner],
                messages: []
            } as SeedChannel);

            console.log('[+] Seeding fake messages in channel [%s]...', channel.id);
            await this.seedFakeMessages(channel, fakeOwner);
        }
    }
}
