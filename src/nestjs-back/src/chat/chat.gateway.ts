import { Server, Socket } from 'socket.io';
import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
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
import { UserStatus } from 'src/games/class/Constants';
import { ChatUser, ChatUsers } from './class/ChatUsers';
import { CreateChannelDto } from './channels/dto/create-channel.dto';
import { CreateDirectMessageDto } from './direct-messages/dto/create-direct-message.dto';
import { CreateChannelMessageDto } from './channels/dto/create-channel-message.dto';
import { CreateDmMessageDto } from './direct-messages/dto/create-dm-message.dto';
import { UpdateChannelDto } from './channels/dto/update-channel.dto';
import { BadRequestTransformationFilter } from './chat-ws-exception-filter';

@WebSocketGateway({
		cors: true,
		namespace: '/chat'
	}
)
@UsePipes(
	new ValidationPipe({
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

	/**
	 * Users
	 */
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
		this.server.to(client.id).emit('channelData', (channel));
	}

	/* Create/delete/update */
	@UseFilters(new BadRequestTransformationFilter())
	@SubscribeMessage('createChannel')
	async handleCreateChannel(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: CreateChannelDto
	) {
		try {
			const channel = await this.chatService.createChannel(data)

			const roomId = `channel_${channel.id}`;

			this.chatUsers.userJoinRoom(client, roomId);
			/* If the channel is visible to everyone, inform every client */
			if (channel.privacy !== 'private') {
				this.server.emit('channelCreated', (channel));
			} else {
				this.server.to(roomId).emit('channelCreated', (channel));
			}
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}

	@UseFilters(new BadRequestTransformationFilter())
	@SubscribeMessage('updateChannel')
	async handleUpdateChannel(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: UpdateChannelDto
	) {
		try {
			const channel = await this.chatService.updateChannel((data as any).id, data);
			const roomId = `channel_${channel.id}`;

			/* If the channel is visible to everyone, inform every client */
			if (channel.privacy !== 'private') {
				this.server.emit('channelUpdated', (channel));
			} else {
				this.server.to(roomId).emit('channelUpdated', (channel));
			}
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}

	@SubscribeMessage('deleteChannel')
	async handleDeleteChannel(
		@ConnectedSocket() client: Socket,
		@MessageBody() { channelId }: { channelId: string }
	) {
		try {
			const channel = await this.chatService.deleteChannel(channelId);

			/* If the channel is visible to everyone, inform every client */
			if (channel.privacy !== 'private') {
				this.server.emit('channelDeleted', channelId);
			} else {
				this.server.to(`channel_${channelId}`).emit('channelDeleted', channelId);
			}
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}

	/* Save a new group message */
	@UseFilters(new BadRequestTransformationFilter())
	@SubscribeMessage('gmSubmit')
	async handleGmSubmit(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: CreateChannelMessageDto
	) {
		try {
			const message = await this.chatService.addMessageToChannel(data);
			const channel = message.channel;

			this.server.to(`channel_${channel.id}`).emit('newGm', { message });
			this.logger.log(`New message in Channel [${channel.id}]`);
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}

	/* User joins/quits channel */
	@SubscribeMessage('joinChannel')
	async handleJoinChannel(
		@ConnectedSocket() client: Socket,
		@MessageBody() { userId, channelId }: { userId: string, channelId: string }
	) {
		try {
			const user = await this.chatService.addUserToChannel(userId, channelId);
			const channel = await this.chatService.getChannelData(channelId);
			const roomId = `channel_${channelId}`;
			const res = {
				message: `${user.username} joined group`,
				userId: userId,
			};

			this.chatUsers.userJoinRoom(client, roomId);
			this.server.to(roomId).emit('joinedChannel', res);

			/* If the channel is visible to everyone, inform every client */
			if (channel.privacy !== 'private') {
				this.server.emit('channelUsersUpdated', (channel)); // TODO
			}
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}

	@SubscribeMessage('leaveChannel')
	async handleLeaveChannel(
		@ConnectedSocket() client: Socket,
		@MessageBody() { userId, channelId }: { userId: string, channelId: string }
	) {
		try {
			const user = await this.chatService.removeUserFromChannel(userId, channelId);
			const channel = await this.chatService.getChannelData(channelId);
			const roomId = `channel_${channelId}`;

			this.chatUsers.userLeaveRoom(client, roomId);
			this.server.to(roomId).emit('leftChannel', `${user.username} left group`);

			/* If the channel is visible to everyone, inform every client */
			if (channel.privacy !== 'private') {
				this.server.emit('channelUsersUpdated', (channel)); // TODO
			}
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}

	@SubscribeMessage('joinProtected')
	async handleJoinProtectedChannel(
		@ConnectedSocket() client: Socket,
		@MessageBody() { userId, channelId, password }: {
			userId: string, channelId: string, password: string
		}
	) {
		try {
			/* If password is wrong, raise an Error */
			await this.chatService.checkChannelPassword(channelId, password);

			const isInChan = await this.chatService.userIsInChannel(userId, channelId);

			if (!isInChan) {
				this.handleJoinChannel(client, { userId, channelId });
			}
			this.server.to(client.id).emit('joinedProtected');

			// this.server.emit('channelUsersUpdated', (channel));
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}

	/* Roles */
	@SubscribeMessage('makeAdmin')
	async handleMakeAdmin(
		@ConnectedSocket() client: Socket,
		@MessageBody() { ownerId, channelId, userId }: {
			ownerId: string, channelId: string, userId: string
		}
	) {
		try {
			await this.chatService.checkPrivileges(ownerId, channelId, true);
			await this.chatService.addAdminToChannel(ownerId, channelId, userId);

			this.server.to(client.id).emit('adminAdded');
			this.logger.log(`User [${userId}] is now admin in Channel [${channelId}]`);
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}

	@SubscribeMessage('removeAdmin')
	async handleRemoveAdmin(
		@ConnectedSocket() client: Socket,
		@MessageBody() { ownerId, channelId, userId }: {
			ownerId: string, channelId: string, userId: string
		}
	) {
		try {
			await this.chatService.checkPrivileges(ownerId, channelId, true);
			await this.chatService.removeAdminFromChannel(ownerId, channelId, userId);

			this.server.to(client.id).emit('adminRemoved');
			this.logger.log(`User [${userId}] no longer admin in Channel [${channelId}]`);
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}

	@SubscribeMessage('punishUser')
	async handlePunishUser(
		@ConnectedSocket() client: Socket,
		@MessageBody() { adminId, channelId, userId }: {
			adminId: string, channelId: string, userId: string
		}
	) {
		try {
			if (adminId === userId) {
				throw new Error('punisherId should be different from punishedId');
			}
			await this.chatService.checkPrivileges(adminId, channelId);
			await this.chatService.punishUser(adminId, channelId, userId);

			const userSocket = this.chatUsers.getUserById(userId);
			const channel = await this.chatService.getChannelData(channelId);

			this.server.to(client.id).emit('userPunished');
			this.server.to(userSocket.socketId).emit('chatPunishment', `You have been banned from ${channel.name}.`);
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}

	@SubscribeMessage('kickUser')
	async handleKickUser(
		@ConnectedSocket() client: Socket,
		@MessageBody() { adminId, channelId, userId }: {
			adminId: string, channelId: string, userId: string
		}
	) {
		try {
			await this.chatService.checkPrivileges(adminId, channelId);
			await this.chatService.removeUserFromChannel(userId, channelId);

			const userSocket = this.chatUsers.getUserById(userId);
			const channel = await this.chatService.getChannelData(channelId);
			const roomId = `channel_${channelId}`;

			// Tmp
			// this.chatUsers.userLeaveRoom(kickedSocket, roomId);
			this.server.to(roomId).emit('userKicked');
			this.server.to(userSocket.socketId).emit('chatPunishment', `You have been kicked from ${channel.name}.`);
			/* If the channel is visible to everyone, inform every client */
			// if (channel.privacy !== 'private') {
			// 	this.server.emit('channelUsersUpdated', (channel));
			// }
			this.logger.log(`User [${userId}] was kicked from Channel [${channelId}]`);
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
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

	@UseFilters(new BadRequestTransformationFilter())
	@SubscribeMessage('createDm')
	async handleCreateDm(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: CreateDirectMessageDto
	) {
		try {
			const dm = await this.chatService.createDm(data);
			const roomId = `dm_${dm.id}`;
			const friend = this.chatUsers.getUserById(data.users[1].id.toString());
			// const friendSocket = (await this.server.fetchSockets()).find(socket => socket.id === friend.socketId);

			this.chatUsers.userJoinRoom(client, roomId);
			this.server.to(roomId).emit('dmCreated', (dm));
			this.server.to(friend.socketId).emit('dmCreated', (dm));
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}

	/* Save a new DM message */
	@UseFilters(new BadRequestTransformationFilter())
	@SubscribeMessage('dmSubmit')
	async handleDmSubmit(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: CreateDmMessageDto
	) {
		try {
			const message = await this.chatService.addMessageToDm(data);

			this.server.to(`dm_${message.dm.id}`).emit('newDm', { message });
			this.logger.log(`New message in DM [${message.dm.id}]`);
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}
}
