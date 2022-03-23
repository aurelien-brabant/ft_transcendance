import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { AuthModule } from 'src/auth/auth.module';
import { MessagesModule } from 'src/chat/messages/messages.module';

@Module({
  imports: [AuthModule, MessagesModule],
  providers: [ChatGateway, ChatService]
})
export class ChatModule {}
