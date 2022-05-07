import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChanMessage } from './entities/chan-messages.entity';
import { ChanMessagesService } from './chan-messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChanMessage])],
  providers: [ChanMessagesService],
  exports: [ChanMessagesService]
})
export class ChanMessagesModule {}
