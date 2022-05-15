/*import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { SeedUser } from './seeder';
import { UsersService } from '../users/users.service';
import { GamesService } from '../games/games.service';
import { faker } from '@faker-js/faker';
import { AchievementsService } from 'src/achievements/achievements.service';
import achievementList from 'src/constants/achievementsList';

@Injectable()
export class SeederService {
    constructor(
        private readonly achievementsService: AchievementsService,
        private readonly usersService: UsersService,
        private readonly gamesService: GamesService,
    ) {}

    async seed() {
        await getConnection().synchronize(true);
        console.log('[+] Creating achievements database...');
        await this.createAchievements();
        console.log('[+] Seeding fake users...');
        await this.seedFakeUsers();
        console.log('[+] Seeding fake games...');
        await this.seedFakeGames();
    }

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
            pic: null,
            password: "test",
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
                    "id": (i === 2) ? 3 : 2,
                },
                {
                    "id": (i === 5) ? 4 : 5,
                }
            ]
        } as SeedUser);
        user = await this.usersService.update(String(i + 1), {
            blockedUsers: [
                {
                    "id": (i === 6) ? 7 : 6,
                },
                {
                    "id": (i === 8) ? 8 : 9,
                }
            ]
        } as SeedUser);
        return user;
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
                players: [winner, looser],
                winnerId: (i < 9) ? i + 1 : 1,
                loserId: (i < 8) ? i + 2 : 2,
                winnerScore: faker.datatype.number(),
                loserScore: faker.datatype.number(),
                createdAt: new Date(Date.now() + i),
                endedAt: new Date(Date.now() + i + 180),
                gameDuration: 0,
            });

            console.log('Game [%s] created', game.id);
        }
    }
}*/

export default null
