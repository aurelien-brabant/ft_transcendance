import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  // OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { UserStatus } from 'src/games/class/Constants';
import { ConnectedUsers, User } from 'src/games/class/ConnectedUsers';

@WebSocketGateway(
  {
    cors: true,
    namespace: '/chat'
  }
)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('Chat Gateway');
  private readonly chatUsers: ConnectedUsers = new ConnectedUsers();

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    this.logger.log('[+] Init Chat Gateway');
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /* TODO: handle disconnection at logout
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const user = this.chatUsers.getUser(client.id);

    if (user) {
      this.logger.log(`Remove user: [${user.id}][${user.username}]`);
      this.chatUsers.removeUser(user);
    }
  }
  */

  /* Add new user to the list of connected users */
  @SubscribeMessage('newUser')
  handleNewUser(@ConnectedSocket() client: Socket, @MessageBody() data: User) {
    let user = this.chatUsers.getUserById(data.id);

    if (!user) {
      user = new User(data.id, data.username, client.id);
      user.setUserStatus(UserStatus.ONLINE);
      this.chatUsers.addUser(user);
    } else {
      user.setSocketId(client.id);
      user.setUsername(data.username);
    }
    this.logger.log(`Add user[${user.id}][${user.username}]`);
    console.log(this.chatUsers); // debug
  }

  /* Send all channels joined by user */
  @SubscribeMessage('getUserChannels')
  async handleUserChannels(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number }
  ) {
    const channels = await this.chatService.getUserChannels(data.userId.toString());

    this.server.to(client.id).emit('updateUserChannels', (channels));
  }

  /* Send all mesages in channel */
  @SubscribeMessage('getChannelData')
  async handleChannelData(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: number }
  ) {
    const channel = await this.chatService.getChannelData(data.channelId.toString());

    this.server.to(client.id).emit('updateChannel', (channel));
  }

  /* Save a new DM message */
  @SubscribeMessage('dmSubmit')
  async handleDmSubmit(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { content: string, from: number, to: number, channelId: string }
  ) {
    const user = this.chatUsers.getUserById(data.from);
    const recipient = this.chatUsers.getUserById(data.to);
    const message = await this.chatService.saveMessage(data.content, data.from.toString(), data.channelId);

    this.logger.log(`${user.username} sends DM "${data.content}" on channel ${data.channelId}`);
    this.server.to(client.id).emit('newDm', { message });
    // TODO: If recipient is offline, message will be sent once connected
    if (recipient) {
      this.logger.log(`Emitting to ${recipient.username} -> socket id: [${recipient.socketId}]`);
      this.server.to(recipient.socketId).emit('newDm', { message });
    }
  }

  /* Save a new group message */
  @SubscribeMessage('gmSubmit')
  async handleGmSubmit(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { content: string, from: number, groupId: string }
  ) {
    const user = this.chatUsers.getUser(client.id);
    // const channel = ;
    const message = await this.chatService.saveMessage(data.content, data.from.toString(), data.groupId);

    this.logger.log(`${user.username} sends message "${data.content}" on channel ${data.groupId}`);
    this.server.to(client.id).emit('newGm', { message });
    // TODO: send to room
    // if (channel) {
    //   this.server.to(recipient.socketId).emit('newGm', { message });
    // }
  }
}
