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
import { UserStatus } from '../games/class/Constants';
import { ConnectedUsers, User } from '../games/class/ConnectedUsers';

@WebSocketGateway(
  {
    cors: true,
    allowEIO3: true,
    // namespace: '/chat'
  }
)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('Chat Gateway');
  private readonly chatUsers: ConnectedUsers = new ConnectedUsers();

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    this.logger.log('[+] Init Chat Gateway');
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    // this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const user = this.chatUsers.getUser(client.id);

    if (user) {
      this.chatUsers.removeUser(user);
      // this.logger.log(`Client disconnected: ${user.username}`)
    }
  }

  @SubscribeMessage('newUser')
  handleNewUser(@ConnectedSocket() client: Socket, @MessageBody() data: User) {
    if (!data.id || !data.username) return ;

    let user = this.chatUsers.getUserById(data.id);
    if (!user) {
      user = new User(data.id, data.username, client.id);
      user.setUserStatus(UserStatus.ONLINE);
      this.chatUsers.addUser(user);
    } else {
      user.setSocketId(client.id);
      user.setUsername(data.username);
    }
    console.log(this.chatUsers);
  }

  @SubscribeMessage('dmSubmit')
  async handleDmSubmit(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { content: string, from: number, to: number, channelId: string }
  ) {
    const user = await this.chatUsers.getUserById(data.from);
    const message = await this.chatService.saveMessage(data.content, data.from.toString(), data.channelId);

    this.logger.log(`${user.username} sends DM "${data.content}" on channel ${data.channelId}`);
    this.logger.log(`Emitting to ${user.username} -> socket id: [${user.socketId}]`);
    this.server.to(user.socketId).emit('newDm', { message });
    // TODO: If recipient is offline, message will be sent once connected
    const recipient = this.chatUsers.getUserById(data.to);
    if (recipient) {
      this.server.to(recipient.socketId).emit('newDm', { message });
    }
  }

  @SubscribeMessage('gmSubmit')
  async handleGmSubmit(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { content: string, groupId: string }
  ) {
    console.log('-----------> gmSubmit');
    console.log(data);
    const user = this.chatUsers.getUser(client.id);
    // const channel = ;
    const message = await this.chatService.saveMessage(data.content, user.id.toString(), data.groupId);

    this.logger.log(`${user.username} sends message "${data.content}" on channel ${data.groupId}`);
    this.server.to(client.id).emit('newGm', { message });
    // TODO: send to room
    // if (channel) {
    //   this.server.to(recipient.socketId).emit('newGm', { message });
    // }
  }
}
