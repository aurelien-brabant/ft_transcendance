import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelMessage } from './entities/channel-messages.entity';
import { ChanMessagesService } from './chan-messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelMessage])],
  providers: [ChanMessagesService],
  exports: [ChanMessagesService]
})
export class ChannelMessagesModule {}
