import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channels.entity';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';

@Module({
  imports: [TypeOrmModule.forFeature([Channel])],
  controllers: [ChannelsController],
  providers: [ChannelsService]
})
export class ChannelsModule {}
