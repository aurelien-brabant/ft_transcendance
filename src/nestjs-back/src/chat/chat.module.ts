import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { MessagesModule } from 'src/chat/messages/messages.module';
import { ChannelsModule } from './channels/channels.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [ChannelsModule, MessagesModule, UsersModule],
  providers: [ChatGateway, ChatService]
})
export class ChatModule {}
