import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { MessagesModule } from 'src/chat/messages/messages.module';
import { ChannelsModule } from './channels/channels.module';
import { UsersModule } from 'src/users/users.module';
import { DirectMessagesModule } from './direct-messages/direct-messages.module';

@Module({
  imports: [ChannelsModule, MessagesModule, UsersModule, DirectMessagesModule],
  providers: [ChatGateway, ChatService]
})
export class ChatModule {}
