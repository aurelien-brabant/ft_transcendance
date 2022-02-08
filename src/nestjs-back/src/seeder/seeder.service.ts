import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/users/entities/users.entity';
import { getConnection, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { GamesService } from '../games/games.service';
const { faker } = require('@faker-js/faker');

@Injectable()
export class SeederService {
    constructor(
        private readonly usersService: UsersService,
        private readonly gamesService: GamesService,
    ) {}

    async seed() {
        await getConnection().synchronize(true);
        console.log('[+] Seeding fake users...');
        await this.seedFakeUsers(); 
        console.log('[+] Seeding fake games...');
        await this.seedFakeGames(); 
    }

    async seedFakeUsers()
    {
        for (let i = 0; i < 100; ++i) {
            let pseudo = faker.internet.userName();
            const user = await this.usersService.seed({
                email: faker.unique(faker.internet.email),
                username: pseudo,
                password: faker.internet.password(),
                rank: faker.datatype.number(),
                phone: faker.phone.phoneNumber(),
                pic: faker.image.imageUrl(),
                duoquadra_login: pseudo + "_42",
                games: [],
                friends: [],
            });

            console.log("User [%s] => [%s] [%s] created", user.id, user.duoquadra_login, user.email);
        }
    }

    async seedFakeGames()
    {
        for (let i = 0; i < 100; ++i) {
            const game = await this.gamesService.create({
                createdAt: faker.date.past(),
//                players: [],
            });

            console.log("Game [%s] created", game.id);
        }
    }
}