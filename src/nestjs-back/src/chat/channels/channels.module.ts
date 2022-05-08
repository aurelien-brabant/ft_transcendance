import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channels.entity';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { ChannelMessagesModule } from './messages/channel-messages.module';
import { ChannelPunishment } from './entities/punishment.entity';
import { ChannelPunishmentsController } from './punishments.controller';
import { PunishmentsService } from './punishments.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    ChannelMessagesModule,
    UsersModule,
    TypeOrmModule.forFeature([Channel, ChannelPunishment])
  ],
  controllers: [ChannelsController, ChannelPunishmentsController],
  providers: [ChannelsService, PunishmentsService],
  exports: [ChannelsService]
})
export class ChannelsModule {}
