import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { MessagesModule } from 'src/chat/messages/messages.module';

@Module({
  imports: [MessagesModule],
  providers: [ChatGateway, ChatService]
})
export class ChatModule {}
