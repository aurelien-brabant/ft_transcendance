import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChannelsModule } from './channels/channels.module';
import { DirectMessagesModule } from './direct-messages/direct-messages.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    ChannelsModule,
    DirectMessagesModule,
    UsersModule
  ],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
