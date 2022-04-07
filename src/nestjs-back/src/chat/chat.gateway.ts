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
    const user: User = this.chatUsers.getUser(socket.id);

    if (user) {
      this.chatUsers.removeUser(user);
      this.logger.log(`Client disconnected: ${user.username}`);
      console.log(this.chatUsers);
    }
  }

  @SubscribeMessage('newUser')
  handleNewUser(@ConnectedSocket() socket: Socket, @MessageBody() data: User) {
    if (!data.id || !data.username) return ;

    let user: User = this.chatUsers.getUserById(data.id);
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
    const user: User = this.chatUsers.getUser(socket.id);

    this.logger.log(`${user.username} sends DM "${data.content}" on channel ${data.channelId}`);

    if (user) {
      const message = await this.chatService.saveMessage(data.content, user.id.toString(), data.channelId);

      this.server.to(socket.id).emit('dmSubmitted', { message });
    }
  }
}
