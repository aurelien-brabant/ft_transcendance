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

  /* Update connected user */
  @SubscribeMessage('updateChatUser')
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

  /* User creates a new channel */
  @SubscribeMessage('createChannel')
  async handleCreateChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() data
  ) {
    const channel = await this.chatService.createChannel(data);

    client.join(`channel_${channel.id}`);
    this.server.to(`channel_${channel.id}`).emit('channelCreated', (channel));
  }

  /* Send all channels data joined by user */
  @SubscribeMessage('getUserChannels')
  async handleUserChannels(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number }
  ) {
    const channels = await this.chatService.getUserChannels(data.userId.toString());

    this.server.to(client.id).emit('updateUserChannels', (channels));
  }

  /* Send a specific channel data */
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
    const message = await this.chatService.saveMessage(data.content, data.from.toString(), data.channelId);
    const recipient = this.chatUsers.getUserById(data.to);

    this.server.to(client.id).emit('newDm', { message });
    /* If recipient is offline, message must be sent once connected */
    if (recipient) {
      this.server.to(recipient.socketId).emit('newDm', { message });
    }
    this.logger.log(`New message in DM [${data.channelId}]`);
  }

  /* Save a new group message */
  @SubscribeMessage('gmSubmit')
  async handleGmSubmit(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { content: string, from: number, channelId: string }
  ) {
    const user = this.chatUsers.getUser(client.id);
    const message = await this.chatService.saveMessage(data.content, data.from.toString(), data.channelId);

    this.logger.log(`[${user.username}] sends message "${data.content}" on channel [${data.channelId}]`);
    this.server.to(`channel_${data.channelId}`).emit('newGm', { message });
  }
}
