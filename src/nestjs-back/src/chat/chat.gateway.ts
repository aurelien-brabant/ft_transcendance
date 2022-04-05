import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');
  private chatUsers = [];

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    this.logger.log('Init Chat Gateway');
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`Client connected: ${socket.id}`);

    socket.on('newUser', (username: string) => {
      this.chatUsers.push({
        socketId: socket.id,
        username: username,
      });
    });
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('messageToServer')
  async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: string
  ) {
    const username = this.chatUsers.find(user => user.socketId === socket.id);

    this.logger.log(`Handle message from Client [${username}]\n${message}`);
    this.server.to(socket.id).emit('Handled message');
  }
}
