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

@WebSocketGateway({ namespace: 'chat', cors: true })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    this.logger.log('Init ChatGateway');
  }

  async handleConnection(socket: Socket) {
    await this.chatService.getUserFromSocket(socket);
    this.logger.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('messageToServer')
  async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: string
  ) {
    const author = await this.chatService.getUserFromSocket(socket);

    this.logger.log(`Handle message from Client [${author.id}]`);
    this.server.emit('messageToClient', data);
    // this.server.to(data.channel).emit('messageToClient', data);
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
