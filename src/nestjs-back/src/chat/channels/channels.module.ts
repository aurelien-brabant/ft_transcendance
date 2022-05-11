import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channels.entity';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { ChannelMessage } from './entities/channel-messages.entity';
import { ChannelMessagesService } from './channel-messages.service';
import { ChannelPunishment } from './entities/punishment.entity';
import { ChannelPunishmentsController } from './punishments.controller';
import { PunishmentsService } from './punishments.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      Channel,
      ChannelMessage,
      ChannelPunishment
    ])
  ],
  controllers: [
    ChannelsController,
    ChannelPunishmentsController
  ],
  providers: [
    ChannelsService,
    ChannelMessagesService,
    PunishmentsService
  ],
  exports: [
    ChannelsService,
    ChannelMessagesService
  ]
})
export class ChannelsModule {}
