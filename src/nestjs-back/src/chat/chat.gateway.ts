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

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('messageToServer')
  async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: string
  ) {
    const sender = await this.chatService.getUserFromSocket(socket);

    this.logger.log(`Received message: ${data}`);
    this.server.emit('messageToClient', { data, sender });
  }

  @SubscribeMessage('joinChannel')
  handleJoinChannel(socket: Socket, channelName: string) {
    socket.join(channelName);
    this.logger.log(`Client [${socket.id}] joined channel ${channelName}`);
    socket.emit('joinedChannel', channelName);
  }

  @SubscribeMessage('leaveChannel')
  handleLeftChannel(socket: Socket, channelName: string) {
    socket.leave(channelName);
    this.logger.log(`Client [${socket.id}] left channel ${channelName}`);
    socket.emit('leftChannel', channelName);
  }
}
