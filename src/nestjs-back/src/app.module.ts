import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module';
import { GamesInvitesModule } from './gamesInvites/gamesInvites.module';
import { FriendsInvitesModule } from './friendsInvites/friendsInvites.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsModule } from './friends/friends.module';

@Module({
  imports: [UsersModule, GamesModule, GamesInvitesModule, FriendsModule, FriendsInvitesModule, TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: 'transcendance',
      password: 'transcendance',
      database: 'postgres',
      autoLoadEntities: true,
      synchronize: true,         // true in Dev // false in production
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
