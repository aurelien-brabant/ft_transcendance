import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { parse } from 'cookie';
import { AuthService } from '../auth/auth.service';
import { MessagesService } from './messages/messages.service';
import { Channel } from './channels/entities/channels.entity';
import { User } from '../users/entities/users.entity';

@Injectable()
export class ChatService {
  constructor(
    private readonly authenticationService: AuthService,
    private readonly messagesService: MessagesService
  ) {}

  async getUserFromSocket(socket: Socket) {
    const cookie = socket.handshake.headers.cookie;
    const { Authentication: authToken } = parse(cookie);
    const user = await this.authenticationService.getUserFromAuthToken(authToken);
    if (!user) {
      throw new WsException("Can't get user from socket: Invalid credentials.");
    }
    return user;
  }

  async saveMessage(content: string, author: User, channel: Channel) {
    return this.messagesService.create({ content, author, channel });
  }
}
