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
import { Channel } from './channels/entities/channels.entity';
import { DirectMessage } from './direct-messages/entities/direct-messages';
import { UserStatus } from 'src/games/class/Constants';
import { ChatUser, ChatUsers } from './class/ChatUsers';

@WebSocketGateway(
	{
		cors: true,
		namespace: '/chat'
	}
)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection {
	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('Chat Gateway');
	private readonly chatUsers: ChatUsers = new ChatUsers();

	constructor(
		private readonly chatService: ChatService
	) {}

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

	@SubscribeMessage('updateChatUser')
	handleNewUser(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: ChatUser
	) {
		let user = this.chatUsers.getUserById(data.id.toString());

		if (!user) {
			user = new ChatUser(data.id, data.username, client.id);
			user.setUserStatus(UserStatus.ONLINE);
			this.chatUsers.addUser(user);
		} else {
			user.setSocketId(client.id);
			user.setUsername(data.username);
		}
		this.logger.log(`Add user[${user.id}][${user.username}]`);
		console.log(this.chatUsers); // debug
	}

	/**
	 * Channels
	 */
	@SubscribeMessage('getUserChannels')
	async handleUserChannels(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { userId: string }
	) {
		const channels = await this.chatService.getUserChannels(data.userId);

		for (var channel of channels) {
			this.chatUsers.userJoinRoom(client, `channel_${channel.id}`);
		}
		this.server.to(client.id).emit('updateUserChannels', (channels));
	}

	@SubscribeMessage('getChannelData')
	async handleChannelData(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { channelId: string }
	) {
		const channel = await this.chatService.getChannelData(data.channelId);

		this.chatUsers.userJoinRoom(client, `channel_${channel.id}`);
		this.server.to(client.id).emit('updateChannel', (channel));
	}

	@SubscribeMessage('createChannel')
	async handleCreateChannel(
		@ConnectedSocket() client: Socket,
		@MessageBody() data
	) {
		let channel: Channel;
		const roomId = `channel_${channel.id}`;

		try {
			channel = await this.chatService.createChannel(data);
		} catch (e) {
			this.server.to(client.id).emit('createChannelError', e.message);
			return ;
		}
		this.chatUsers.userJoinRoom(client, roomId);
		this.server.to(roomId).emit('channelCreated', (channel));
	}

	/* Save a new group message */
	@SubscribeMessage('gmSubmit')
	async handleGmSubmit(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { content: string, from: number, channelId: string }
	) {
		const message = await this.chatService.addMessageToChannel(data.content, data.channelId, data.from.toString());

		this.logger.log(`user [${data.from}] sends message "${data.content}" on channel [${data.channelId}]`);
		this.server.to(`channel_${data.channelId}`).emit('newGm', { message });
	}

	/* User joins/quits channel */
	@SubscribeMessage('joinChannel')
	async handleJoinChannel(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { userId: string, channelId: string }
	) {
		let user: any;

		try {
			user = await this.chatService.addUserToChannel(data.userId, data.channelId);
		} catch (e) {
			this.server.to(client.id).emit('joinChannelError', e.message);
			return ;
		}

		const roomId = `channel_${data.channelId}`;
		const res = {
			message: `${user.username} joined group`,
			userId: data.userId,
		};

		this.chatUsers.userJoinRoom(client, roomId);
		this.server.to(roomId).emit('joinedChannel', res);
	}

	@SubscribeMessage('quitChannel')
	async handleQuitChannel(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { userId: string, channelId: string }
	) {
		let user;

		try {
			user = await this.chatService.removeUserFromChannel(data.userId, data.channelId);
		} catch (e) {
			this.server.to(client.id).emit('quitChannelError', e.message);
			return ;
		}

		const roomId = `channel_${data.channelId}`;
		const res = {
			message: `${user.username} left group`,
			userId: data.userId,
		};

		this.chatUsers.userLeaveRoom(client, roomId);
		this.server.to(roomId).emit('quittedChannel', res);
	}

	/**
	 * Direct Messages
	 */
	@SubscribeMessage('getUserDms')
	async handleUserDms(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { userId: string }
	) {
		const dms = await this.chatService.getUserDms(data.userId);

		for (var dm of dms) {
			this.chatUsers.userJoinRoom(client, `dm_${dm.id}`);
		}
		this.server.to(client.id).emit('updateUserDms', (dms));
	}

	@SubscribeMessage('getDmData')
	async handleDmData(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { dmId: string }
	) {
		const dm = await this.chatService.getDmData(data.dmId);
		const roomId = `dm_${dm.id}`;

		this.chatUsers.userJoinRoom(client, roomId);
		this.server.to(client.id).emit('updateDm', (dm));
	}

	@SubscribeMessage('createDm')
	async handleCreateDm(
		@ConnectedSocket() client: Socket,
		@MessageBody() data
	) {
		let dm: DirectMessage;

		try {
			dm = await this.chatService.createDm(data);
		} catch (e) {
			this.server.to(client.id).emit('createDmError', e.message);
			return ;
		}
		this.server.to(client.id).emit('dmCreated', (dm));
	}

	/* Save a new DM message */
	@SubscribeMessage('dmSubmit')
	async handleDmSubmit(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { content: string, from: string, dmId: string }
	) {
		const message = await this.chatService.addMessageToDm(data.content, data.dmId, data.from.toString());

		this.server.to(`dm_${data.dmId}`).emit('newDm', { message });
		this.logger.log(`New message in DM [${data.dmId}]`);
	}
}
