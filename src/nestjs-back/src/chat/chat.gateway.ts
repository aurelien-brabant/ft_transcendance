import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway({ namespace: 'chat', cors: true })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  afterInit(server: Server) {
    this.logger.log('Init ChatGateway');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('messageToServer')
  handleMessage(@MessageBody() data: string): void {
    this.logger.log(`Received message: ${data}`);
    this.server.emit('messageToClient', data);
  }

  @SubscribeMessage('joinChannel')
  handleJoinChannel(client: Socket, channelName: string) {
    client.join(channelName);
    this.logger.log(`Client [${client.id}] joined channel ${channelName}`);
    client.emit('joinedChannel', channelName);
  }

  @SubscribeMessage('leaveChannel')
  handleLeftChannel(client: Socket, channelName: string) {
    client.leave(channelName);
    this.logger.log(`Client [${client.id}] left channel ${channelName}`);
    client.emit('leftChannel', channelName);
  }
}
