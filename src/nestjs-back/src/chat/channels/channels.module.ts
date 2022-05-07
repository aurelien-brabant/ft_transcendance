import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channels.entity';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { UsersModule } from 'src/users/users.module';
import { PunishmentsService } from './punishments.service';
import { ChannelPunishmentsController } from './punishments.controller';
import { ChannelPunishment } from './entities/punishment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Channel, ChannelPunishment]), UsersModule],
  controllers: [ChannelsController, ChannelPunishmentsController],
  providers: [ChannelsService, PunishmentsService],
  exports: [ChannelsService]
})
export class ChannelsModule {}
