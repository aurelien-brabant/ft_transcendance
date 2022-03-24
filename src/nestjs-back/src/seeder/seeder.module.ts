import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from 'src/games/entities/games.entity';
import { GamesService } from 'src/games/games.service';
import { User } from '../users/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from '../users/users.module';
import { Channel } from "src/chat/channels/entities/channels.entity";
import { ChannelsService } from 'src/chat/channels/channels.service';
import { Message } from 'src/chat/messages/entities/messages.entity';
import { MessagesService } from 'src/chat/messages/messages.service';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User, Game, Channel, Message])],
  providers: [
    UsersService,
    GamesService,
    ChannelsService,
    MessagesService,
    SeederService ],
  exports: [SeederModule]
})
export class SeederModule {}
