import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AchievementsModule } from './achievements/achievements.module';
import { AuthModule } from './auth/auth.module';
import { ChannelsModule } from './chat/channels/channels.module';
import { ChatModule } from './chat/chat.module';
import { FriendsInvitesModule } from './friendsInvites/friendsInvites.module';
import { GamesModule } from './games/games.module';
import { GamesInvitesModule } from './gamesInvites/gamesInvites.module';
import { MessagesModule } from './chat/messages/messages.module';
import { SeederModule } from './seeder/seeder.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AchievementsModule,
    AuthModule,
    ChannelsModule,
    ChatModule,
    FriendsInvitesModule,
    GamesModule,
    GamesInvitesModule,
    MessagesModule,
    SeederModule,
    UsersModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: `${process.env.POSTGRES_HOST}`,
      port: 5432,
      username: `${process.env.POSTGRES_USER}`,
      password: `${process.env.POSTGRES_PASSWORD}`,
      database: `${process.env.POSTGRES_HOST}`,
      autoLoadEntities: true,
      synchronize: true,         // true in Dev // false in production
      keepConnectionAlive: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
