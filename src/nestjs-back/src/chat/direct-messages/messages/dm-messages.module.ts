import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DmMessage } from './entities/dm-messages.entity';
import { DmMessagesService } from './dm-messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([DmMessage])],
  providers: [DmMessagesService],
  exports: [DmMessagesService]
})
export class DmMessagesModule {}
