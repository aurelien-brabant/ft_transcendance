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
import { User, ChatRoom } from './class/ChatRoom';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');
  private readonly room: ChatRoom = new ChatRoom();

  constructor(private readonly chatService: ChatService) {}
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`client connected...`);
  }

  afterInit(server: Server) {
    this.logger.log('[+] Init Chat Gateway');
  }

  @SubscribeMessage('handleChatConnect')
	handleChatConnect(@ConnectedSocket() client: Socket, @MessageBody() user: User) {
	  let newUser: User;
    if (user) {
  	  newUser = new User(user.id, user.username, client.id);
      newUser.setSocketId(client.id);
	    this.room.addUser(newUser);
      this.server.to(newUser.socketId).emit('joinChat', this.room);
		  for (let i in this.room.users)
		    this.server.to(this.room.users[i].socketId).emit('updateChatRoomLen', this.room.users.length)
		  }
	}

	async handleDisconnect(@ConnectedSocket() client: Socket) {
		const user = this.room.getUser(client.id);

		if (user) {
      this.logger.log(`Client ${user.username} disconnected: ${client.id}`);
			this.room.removeUser(user);
    	this.server.to(user.socketId).emit('leaveChat', this.room)
			for (let i in this.room.users)
			  this.server.to(this.room.users[i].socketId).emit('updateChatRoomLen', this.room.users.length)
	  }
	}
}
