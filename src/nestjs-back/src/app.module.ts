import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module';
import { GamesInvitesModule } from './gamesInvites/gamesInvites.module';
import { FriendsInvitesModule } from './friendsInvites/friendsInvites.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsModule } from './friends/friends.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UsersModule, GamesModule, GamesInvitesModule, FriendsModule, FriendsInvitesModule, TypeOrmModule.forRoot({
      type: 'postgres',
      host: `${process.env.POSTGRES_HOST}`,
      port: 5432,
      username: `${process.env.POSTGRES_USER}`,
      password: `${process.env.POSTGRES_PASSWORD}`,
      database: `${process.env.POSTGRES_HOST}`,
      autoLoadEntities: true,
      synchronize: true,         // true in Dev // false in production
    }), AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
