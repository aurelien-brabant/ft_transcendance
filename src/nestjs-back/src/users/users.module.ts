import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from 'src/games/entities/games.entity';
import { User } from './entities/users.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AchievementsService } from '../achievements/achievements.service';
import { AchievementsModule } from 'src/achievements/achievements.module';
import { Achievement } from 'src/achievements/entities/achievements.entity';

@Module({
    imports: [AchievementsModule, TypeOrmModule.forFeature([User, Game, Achievement])], 
    controllers: [UsersController], 
    providers: [UsersService, AchievementsService],
    exports: [UsersService]
})
export class UsersModule {}
