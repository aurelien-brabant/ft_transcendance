import { Server, Socket } from 'socket.io';
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
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
import { User } from 'src/users/entities/users.entity';
import { CreateChannelDto } from './channels/dto/create-channel.dto';
import { CreateDirectMessageDto } from './direct-messages/dto/create-direct-message.dto';
import { CreateChannelMessageDto } from './channels/dto/create-channel-message.dto';
import { CreateDmMessageDto } from './direct-messages/dto/create-dm-message.dto';

@WebSocketGateway({
		cors: true,
		namespace: '/chat'
	}
)
@UsePipes(
	new ValidationPipe({
		whitelist: true,
		forbidNonWhitelisted: true,
		transform: true,
		transformOptions: {
			enableImplicitConversion: true
		}
	}),
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

	@SubscribeMessage('updateChatUser')
	handleNewUser(
		@ConnectedSocket() client: Socket,
		@MessageBody() newUser: ChatUser
	) {
		let user = this.chatUsers.getUserById(newUser.id.toString());

		if (!user) {
			user = new ChatUser(newUser.id, newUser.username, client.id);
			user.setUserStatus(UserStatus.ONLINE);
			this.chatUsers.addUser(user);
		} else {
			user.setSocketId(client.id);
			user.setUsername(newUser.username);
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
		@MessageBody() { userId }: { userId: string }
	) {
		const channels = await this.chatService.getUserChannels(userId);

		for (var channel of channels) {
			this.chatUsers.userJoinRoom(client, `channel_${channel.id}`);
		}
		this.server.to(client.id).emit('updateUserChannels', (channels));
	}

	@SubscribeMessage('getChannelData')
	async handleChannelData(
		@ConnectedSocket() client: Socket,
		@MessageBody() { channelId }: { channelId: string }
	) {
		const channel = await this.chatService.getChannelData(channelId);

		this.chatUsers.userJoinRoom(client, `channel_${channel.id}`);
		this.server.to(client.id).emit('updateChannel', (channel));
	}

	@SubscribeMessage('createChannel')
	async handleCreateChannel(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: CreateChannelDto
	) {
		let channel: Channel;

		try {
			channel = await this.chatService.createChannel(data);
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
			return ;
		}
		const roomId = `channel_${channel.id}`;

		this.chatUsers.userJoinRoom(client, roomId);
		this.server.to(roomId).emit('channelCreated', (channel));
	}

	@SubscribeMessage('deleteChannel')
	async handleDeleteChannel(
		@ConnectedSocket() client: Socket,
		@MessageBody() { channelId }: { channelId: string }
	) {
		try {
			await this.chatService.deleteChannel(channelId);
			this.server.to(`channel_${channelId}`).emit('channelDeleted', channelId);
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
			return ;
		}
	}

	/* Save a new group message */
	@SubscribeMessage('gmSubmit')
	async handleGmSubmit(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: CreateChannelMessageDto
	) {
		try {
			const message = await this.chatService.addMessageToChannel(data);

			this.server.to(`channel_${message.channel.id}`).emit('newGm', { message });
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}

	/* User joins/quits channel */
	@SubscribeMessage('joinChannel')
	async handleJoinChannel(
		@ConnectedSocket() client: Socket,
		@MessageBody() { userId, channelId }: {
			userId: string, channelId: string
		}
	) {
		let user: User;

		try {
			user = await this.chatService.addUserToChannel(userId, channelId);
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
			return ;
		}

		const roomId = `channel_${channelId}`;
		const res = {
			message: `${user.username} joined group`,
			userId: userId,
		};

		this.chatUsers.userJoinRoom(client, roomId);
		this.server.to(roomId).emit('joinedChannel', res);
	}

	@SubscribeMessage('leaveChannel')
	async handleLeaveChannel(
		@ConnectedSocket() client: Socket,
		@MessageBody() { userId, channelId }: {
			userId: string, channelId: string
		}
	) {
		let user: User;

		try {
			user = await this.chatService.removeUserFromChannel(userId, channelId);
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
			return ;
		}

		const roomId = `channel_${channelId}`;
		const res = {
			message: `${user.username} left group`,
		};

		this.chatUsers.userLeaveRoom(client, roomId);
		this.server.to(roomId).emit('leftChannel', res);
	}

	@SubscribeMessage('joinProtected')
	async handleJoinProtectedChannel(
		@ConnectedSocket() client: Socket,
		@MessageBody() { userId, channelId, password }: { 
			userId: string, channelId: string, password: string
		}
	) {
		let user: User;
		const roomId = `channel_${channelId}`;

		try {
			await this.chatService.checkChannelPassword(channelId, password);

			const isInChan = await this.chatService.userIsInChannel(userId, channelId);

			if (!isInChan) {
				user = await this.chatService.addUserToChannel(userId, channelId);
				const res = {
					message: `${user.username} joined group`,
					userId: userId,
				};
				this.server.to(roomId).emit('joinedChannel', res);
			}
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
			return ;
		}
		this.server.to(client.id).emit('joinedProtected');
		this.chatUsers.userJoinRoom(client, roomId);
	}

	/**
	 * Direct Messages
	 */
	@SubscribeMessage('getUserDms')
	async handleUserDms(
		@ConnectedSocket() client: Socket,
		@MessageBody() { userId }: { userId: string }
	) {
		const dms = await this.chatService.getUserDms(userId);

		for (var dm of dms) {
			this.chatUsers.userJoinRoom(client, `dm_${dm.id}`);
		}
		this.server.to(client.id).emit('updateUserDms', (dms));
	}

	@SubscribeMessage('getDmData')
	async handleDmData(
		@ConnectedSocket() client: Socket,
		@MessageBody() { dmId }: { dmId: string }
	) {
		const dm = await this.chatService.getDmData(dmId);
		const roomId = `dm_${dm.id}`;

		this.chatUsers.userJoinRoom(client, roomId);
		this.server.to(client.id).emit('updateDm', (dm));
	}

	@SubscribeMessage('createDm')
	async handleCreateDm(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: CreateDirectMessageDto
	) {
		let dm: DirectMessage;

		try {
			dm = await this.chatService.createDm(data);
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
			return ;
		}
		this.server.to(client.id).emit('dmCreated', (dm));
	}

	/* Save a new DM message */
	@SubscribeMessage('dmSubmit')
	async handleDmSubmit(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: CreateDmMessageDto
	) {
		try {
			const message = await this.chatService.addMessageToDm(data);

			this.logger.log(`New message in DM [${message.dm.id}]`);
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}
}
