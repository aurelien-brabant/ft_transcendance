import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Games } from 'src/games/entities/games.entity';
import { GamesService } from 'src/games/games.service';
import { Users } from '../users/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from '../users/users.module';
import { Channels } from "src/channels/entities/channels.entity";
import { ChannelsService } from 'src/channels/channels.service';
import { Messages } from 'src/messages/entities/messages.entity';
import { MessagesService } from 'src/messages/messages.service';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Users, Games, Channels, Messages])],
  providers: [
    UsersService,
    GamesService,
    ChannelsService,
    MessagesService,
    SeederService ],
  exports: [SeederModule]
})
export class SeederModule {}
