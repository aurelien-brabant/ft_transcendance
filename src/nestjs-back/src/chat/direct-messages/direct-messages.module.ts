import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectMessage } from './entities/direct-messages';
import { DirectMessagesService } from './direct-messages.service';
import { DirectMessagesController } from 'src/chat/direct-messages/direct-messages.controller';
import { DmMessagesModule } from 'src/chat/direct-messages/messages/dm-messages.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    DmMessagesModule,
    UsersModule,
    TypeOrmModule.forFeature([DirectMessage])
  ],
  controllers: [DirectMessagesController],
  providers: [DirectMessagesService],
  exports: [DirectMessagesService]
})
export class DirectMessagesModule {}
