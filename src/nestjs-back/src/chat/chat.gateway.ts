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
    this.logger.log(`Client connected`);
    socket.on('newUser', (username: string) => {
      this.chatUsers.push({
        socketId: socket.id,
        username: username,
      });
    });
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Client disconnected`);
  }

  @SubscribeMessage('messageToServer')
  async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: string
  ) {
    this.logger.log(`Handle message from Client [${socket.id}]\n${data}`);
    this.server.emit('messageToClient', data);
  }

  // @SubscribeMessage('joinChannel')
  // joinChannel(
  //   @ConnectedSocket() socket: Socket,
  //   @MessageBody() data: string
  // ) {
  //   socket.join(data, (err) => {
  //     if (err) {
  //       console.log('error ', err);
  //     }
  //   });
  //   this.logger.log(`Client [${socket.id}] joined channel ${channelName}`);
  // }
}
