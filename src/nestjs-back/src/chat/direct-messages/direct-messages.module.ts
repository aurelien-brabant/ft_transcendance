import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectMessage } from './entities/direct-messages';
import { DirectMessagesService } from './direct-messages.service';
import { DirectMessagesController } from 'src/chat/direct-messages/direct-messages.controller';
import { DmMessage } from './entities/dm-messages.entity';
import { DmMessagesService } from './dm-messages.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      DirectMessage,
      DmMessage
    ])
  ],
  controllers: [DirectMessagesController],
  providers: [
    DirectMessagesService,
    DmMessagesService
  ],
  exports: [
    DirectMessagesService,
    DmMessagesService
  ]
})
export class DirectMessagesModule {}
