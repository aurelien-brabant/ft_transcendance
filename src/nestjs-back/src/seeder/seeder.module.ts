import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from 'src/games/entities/games.entity';
import { GamesService } from 'src/games/games.service';
import { User } from '../users/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from '../users/users.module';
import { ChatModule } from 'src/chat/chat.module';
import { Channel } from "src/chat/channels/entities/channels.entity";
// import { SeederService } from './seeder.service';
import { AchievementsService } from 'src/achievements/achievements.service';
import { Achievement } from 'src/achievements/entities/achievements.entity';
import { AchievementsModule } from 'src/achievements/achievements.module';

@Module({
  imports: [
    ChatModule,
    UsersModule,
    AchievementsModule,
    TypeOrmModule.forFeature([User, Game, Channel, Achievement])],
  providers: [
    UsersService,
    GamesService,
    // SeederService,
    AchievementsService ],
  exports: [SeederModule]
})
export class SeederModule {}
