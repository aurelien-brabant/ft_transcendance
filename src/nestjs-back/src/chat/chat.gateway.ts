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
import { ConnectedUsers, User, userStatus } from '../games/class/Room';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');
  private readonly chatUsers: ConnectedUsers = new ConnectedUsers();

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    this.logger.log('Init Chat Gateway');
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    const user = this.chatUsers.getUser(socket.id);

    if (user) {
      this.chatUsers.removeUser(user);
      this.logger.log(`Client disconnected: ${user.username}`);
      console.log(this.chatUsers);
    }
  }

  @SubscribeMessage('newUser')
  handleNewUser(@ConnectedSocket() socket: Socket, @MessageBody() data: User) {
    if (!data.id || !data.username) return ;

    let user = this.chatUsers.getUserById(data.id);
    if (!user) {
      user = new User(data.id, data.username, socket.id);
      user.setUserStatus(userStatus.ONLINE);
      this.chatUsers.addUser(user);
      this.logger.log(`Added new user: ${user.username}`);
    } else {
      user.setSocketId(socket.id);
      user.setUsername(data.username);
      this.logger.log(`Updated user: ${user.username}`);
    }
    console.log(this.chatUsers);
  }

  @SubscribeMessage('dmSubmit')
  async handleDmSubmit(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { content: string, to: string, channelId: string }
  ) {
    const user = this.chatUsers.getUser(socket.id);
    const recipient = this.chatUsers.getUser(data.to);
    const message = await this.chatService.saveMessage(data.content, user.id.toString(), data.channelId);

    this.logger.log(`${user.username} sends DM "${data.content}" on channel ${data.channelId}`);
    this.server.to(socket.id).emit('newDm', { message });
    /* If recipient is offline, message will be sent once connected */
    if (recipient) {
      this.server.to(recipient.socketId).emit('newDm', { message });
    }
  }

  @SubscribeMessage('gmSubmit')
  async handleGmSubmit(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { content: string, groupId: string }
  ) {
    const user = this.chatUsers.getUser(socket.id);
    // const channel = ;
    const message = await this.chatService.saveMessage(data.content, user.id.toString(), data.groupId);

    this.logger.log(`${user.username} sends message "${data.content}" on channel ${data.groupId}`);
    this.server.to(socket.id).emit('newGm', { message });
    // TODO: send to room
    // if (channel) {
    //   this.server.to(recipient.socketId).emit('newGm', { message });
    // }
  }
}
