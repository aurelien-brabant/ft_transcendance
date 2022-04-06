import { Injectable } from '@nestjs/common';
import { MessagesService } from './messages/messages.service';
import { Channel } from './channels/entities/channels.entity';
import { User } from '../users/entities/users.entity';

@Injectable()
export class ChatService {
  constructor(
    private readonly messagesService: MessagesService
  ) {}

  async saveMessage(content: string, author: User, channel: Channel) {
    return this.messagesService.create({ content, author, channel });
  }
}
