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
	WsException,
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
import { PongGateway } from 'src/games/pong.gateway';
import { User } from 'src/games/class/ConnectedUsers';

@WebSocketGateway({
		cors: true,
		namespace: '/chat',
		transports: ['websocket']
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
		private readonly chatService: ChatService,
		private readonly pongGateway: PongGateway,
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

	@SubscribeMessage('disconnect')
	async handleDisconnect(@ConnectedSocket() client: Socket) {
		let user = this.chatUsers.getUser(client.id);

		if (user) {
			this.server.emit('updateUserStatus', {
				userId: user.id,
				status: UserStatus[UserStatus.OFFLINE]
			});

			this.logger.log(`User [${user.id}][${user.username}] disconnected`);
			this.chatUsers.removeUser(user);
		}
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
		this.server.emit('updateUserStatus', {
			userId: user.id,
			status: UserStatus[user.status]
		});
		this.logger.log(`Add user[${user.id}][${user.username}]`);
	}

	userJoinRoom(socketId: string, roomId: string) {
		this.chatUsers.addRoomToUser(socketId, roomId);
		this.server.in(socketId).socketsJoin(roomId);
	}

	userLeaveRoom(socketId: string, roomId: string) {
		this.chatUsers.addRoomToUser(socketId, roomId);
		this.server.in(socketId).socketsLeave(roomId);
	}

	@SubscribeMessage('getUserStatus')
	async handleGetUserStatus(
		@ConnectedSocket() client: Socket,
		@MessageBody() { userId }: { userId: number }
	) {
		const user = this.chatUsers.getUserById(userId.toString());

		if (user) {
			this.server.emit('updateUserStatus', {
				userId,
				status: UserStatus[user.status]
			});
		} else {
			this.server.emit('updateUserStatus', {
				userId,
				status: UserStatus[UserStatus.OFFLINE]
			});
		}
	}

	/**
	 * Game-related
	 */
	@SubscribeMessage('userGameStatus')
	async handleUserGameStatus(
		@ConnectedSocket() client: Socket,
		@MessageBody() { isPlaying }: { isPlaying: boolean }
	) {
		const user = this.chatUsers.getUser(client.id);

		if (user) {
			if (isPlaying) {
				user.setUserStatus(UserStatus.PLAYING);
			}
			else {
				user.setUserStatus(UserStatus.ONLINE);
			}
			this.server.emit('updateUserStatus', {
				userId: user.id,
				status: UserStatus[user.status]
			});
		}
	}

	@SubscribeMessage('acceptPongInvite')
	async handleAcceptPongInvite(
		@ConnectedSocket() client: Socket,
		@MessageBody() { roomId, userId }: { roomId: string, userId: number }
	) {
		try {
			this.pongGateway.setInviteRoomToReady(roomId);
			this.logger.log(`Pong invite accepted by User [${userId}]`);

			this.server.to(client.id).emit('redirectToGame');
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}

	@SubscribeMessage('sendPongInvite')
	async handleSendPongInvite(
		@ConnectedSocket() client: Socket,
		@MessageBody() { senderId, receiverId }: { senderId: number, receiverId: number }
	) {
		try {
			this.pongGateway.roomAlreadyExists(senderId, receiverId);

			let dm = await this.chatService.checkIfDmExists(senderId.toString(), receiverId.toString());
			const sender = this.chatUsers.getUser(client.id);
			const receiver = this.chatUsers.getUserById(receiverId.toString());

			if (!dm) {
				dm = await this.chatService.createDm({
					users: [ { id: senderId }, { id: receiverId } ],
				} as CreateDirectMessageDto);

				if (receiver) {
					this.userJoinRoom(receiver.socketId, `dm_${dm.id}`);
					this.server.to(receiver.socketId).emit('dmCreated');
				}
			}
			if (receiver) {
				this.server.to(receiver.socketId).emit(
					'chatInfo',
					`${sender.username} wants to play Pong! Open your DM and accept the challenge!`
				);
			}

			const roomId = await this.pongGateway.createInviteRoom(
				{ id: sender.id, username: sender.username } as User,
				receiverId
			);

			const message = await this.chatService.addMessageToDm({
				content: 'Let\'s play!',
				author: { id: senderId },
				type: 'invite',
				roomId,
				dm
			} as CreateDmMessageDto);

			this.server.to(`dm_${dm.id}`).emit('newPongInvite', { message });
			this.logger.log(`New Pong invite in DM [${message.dm.id}]`);
			this.server.to(client.id).emit('launchInviteGame');
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}

	/**
	 * Channels
	 */
	@SubscribeMessage('getUserChannels')
	async handleUserChannels(
		@ConnectedSocket() client: Socket,
		@MessageBody() { userId }: { userId: number }
	) {
		const channels = await this.chatService.getUserChannels(userId);

		for (const channel of channels) {
			this.userJoinRoom(client.id, `channel_${channel.id}`);
		}
		this.server.to(client.id).emit('updateUserChannels', (channels));
	}

	@SubscribeMessage('getChannelData')
	async handleChannelData(
		@ConnectedSocket() client: Socket,
		@MessageBody() { channelId }: { channelId: number }
	) {
		const channel = await this.chatService.getChannelData(channelId);

		this.userJoinRoom(client.id, `channel_${channel.id}`);
		this.server.to(client.id).emit('channelData', (channel));
	}

	@SubscribeMessage('getChannelUserList')
	async handleChannelUserList(
		@ConnectedSocket() client: Socket,
		@MessageBody() { channelId }: { channelId: number }
	) {
		const channel = await this.chatService.getChannelUserList(channelId);

		this.server.to(client.id).emit('channelUserList', (channel));
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

			this.userJoinRoom(client.id, roomId);
			/* If the channel is visible to everyone, inform every client */
			if (channel.privacy !== 'private') {
				this.server.socketsJoin(roomId);
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
		@MessageBody() { channelId }: { channelId: number }
	) {
		try {
			const channel = await this.chatService.deleteChannel(channelId);
			const roomId = `channel_${channelId}`;

			/* If the channel is visible to everyone, inform every client */
			if (channel.privacy !== 'private') {
				this.server.emit('channelDeleted', channelId);
			} else {
				this.server.to(roomId).emit('channelDeleted', channelId);
				this.server.socketsLeave(roomId);
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
			if (!data.author) {
				throw new WsException('Anonymous messages not allowed.');
			}
			await this.chatService.checkIfUserIsMuted(data.channel.id, data.author.id);
			const message = await this.chatService.addMessageToChannel(data);
			const channel = message.channel;

			this.server.to(`channel_${channel.id}`).emit('newGm', { message });
			this.logger.log(`New message in Channel [${channel.id}]`);
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}

	/* User joins/quits channel */
	@SubscribeMessage('openChannel')
	async handleOpenChannel(
		@ConnectedSocket() client: Socket,
		@MessageBody() { channelId, userId }: { channelId: number, userId: number }
	) {
		try {
			await this.chatService.checkIfUserIsBanned(channelId, userId);

			this.server.to(client.id).emit('canOpenChannel', channelId);
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}

	@SubscribeMessage('joinChannel')
	async handleJoinChannel(
		@ConnectedSocket() client: Socket,
		@MessageBody() { channelId, userId }: { channelId: number, userId: number }
	) {
		try {
			const channel = await this.chatService.getChannelData(channelId);
			const user = await this.chatService.addUserToChannel(channel, userId);
			const message = await this.chatService.addMessageToChannel({
				content: `${user.username} joined group`,
				channel
			});
			const roomId = `channel_${channelId}`;

			/* If the channel is visible to everyone, inform every client */
			if (channel.privacy !== 'private') {
				this.server.emit('peopleCountChanged', (channel));
			}
			this.userJoinRoom(client.id, roomId);
			this.server.to(roomId).emit('joinedChannel', { message, userId });
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}

	@SubscribeMessage('leaveChannel')
	async handleLeaveChannel(
		@ConnectedSocket() client: Socket,
		@MessageBody() { channelId, userId }: { channelId: number, userId: number }
	) {
		try {
			const channel = await this.chatService.getChannelData(channelId);
			const user = await this.chatService.removeUserFromChannel(channel, userId);
			const message = await this.chatService.addMessageToChannel({
				content: `${user.username} left group`,
				channel
			});
			const roomId = `channel_${channelId}`;

			this.userLeaveRoom(client.id, roomId);
			this.server.to(roomId).emit('leftChannel', { message, userId });

			/* If the channel is visible to everyone, inform every client */
			if (channel.privacy !== 'private') {
				this.server.emit('peopleCountChanged', (channel));
			}
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}

	@SubscribeMessage('joinProtected')
	async handleJoinProtectedChannel(
		@ConnectedSocket() client: Socket,
		@MessageBody() { channelId, userId, password }: {
			channelId: number, userId: number, password: string
		}
	) {
		try {
			/* If password is wrong, raise an Error */
			await this.chatService.checkChannelPassword(channelId, password);

			const isInChan = await this.chatService.userIsInChannel(channelId, userId);

			this.server.to(client.id).emit('joinedProtected');

			if (!isInChan) {
				this.handleJoinChannel(client, { channelId, userId });
			}
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}

	/* Roles */
	@SubscribeMessage('makeAdmin')
	async handleMakeAdmin(
		@ConnectedSocket() client: Socket,
		@MessageBody() { channelId, ownerId, userId }: {
			channelId: number, ownerId: number, userId: number
		}
	) {
		if (ownerId === userId) {
			throw new WsException('Owner and admin are separate roles.');
		}
		try {
			const channel = await this.chatService.getChannelData(channelId);

			if (channel.owner.id != ownerId) {
				throw new Error('Insufficient Privileges');
			}
			await this.chatService.addAdminToChannel(channel, userId);
			this.server.to(client.id).emit('adminAdded');
			this.logger.log(`User [${userId}] is now admin in Channel [${channel.name}]`);

			const chatUser = this.chatUsers.getUserById(userId.toString());

			if (chatUser) {
				this.server.to(chatUser.socketId).emit('chatInfo', `You are now admin in ${channel.name}.`);
			}
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}

	@SubscribeMessage('removeAdmin')
	async handleRemoveAdmin(
		@ConnectedSocket() client: Socket,
		@MessageBody() { channelId, ownerId, userId }: {
			channelId: number, ownerId: number, userId: number
		}
	) {
		if (ownerId === userId) {
			throw new WsException('Owner and admin are separate roles.');
		}
		try {
			const channel = await this.chatService.getChannelData(channelId);

			if (channel.owner.id != ownerId) {
				throw new Error('Insufficient Privileges');
			}
			await this.chatService.removeAdminFromChannel(channel, userId);
			this.server.to(client.id).emit('adminRemoved');
			this.logger.log(`User [${userId}] no longer admin in Channel [${channel.name}]`);

			const chatUser = this.chatUsers.getUserById(userId.toString());

			if (chatUser) {
				this.server.to(chatUser.socketId).emit('chatInfo', `You are no longer admin in ${channel.name}.`);
			}
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}

	@SubscribeMessage('kickUser')
	async handleKickUser(
		@ConnectedSocket() client: Socket,
		@MessageBody() { channelId, adminId, userId }: {
			channelId: number, adminId: number, userId: number
		}
	) {
		if (adminId === userId) {
			throw new WsException('If you want to leave the channel, go to Channel settings.');
		}
		try {
			const admin = this.chatUsers.getUserById(adminId.toString());
			const channel = await this.chatService.getChannelData(channelId);
			const user = await this.chatService.kickUser(channel, adminId, userId);
			const message = await this.chatService.addMessageToChannel({
				content: `${admin.username} kicked ${user.username}`,
				channel
			});
			const roomId = `channel_${channelId}`;
			const chatUser = this.chatUsers.getUserById(userId.toString());

			if (chatUser) {
				this.server.to(chatUser.socketId).emit('kickedFromChannel', `You have been kicked from ${channel.name}.`);
				this.userLeaveRoom(chatUser.socketId, roomId);
			}

			this.server.to(roomId).emit('userKicked', message);
			/* If the channel is visible to everyone, inform every client */
			if (channel.privacy !== 'private') {
				this.server.emit('peopleCountChanged', (channel));
			}
			this.logger.log(`User [${userId}] was kicked from Channel [${channelId}]`);
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}

	@SubscribeMessage('punishUser')
	async handlePunishUser(
		@ConnectedSocket() client: Socket,
		@MessageBody() { channelId, adminId, userId, type }: {
			channelId: number, adminId: number, userId: number, type: string
		}
	) {
		if (adminId === userId) {
			throw new WsException('Don\'t be so mean to yourself. :(');
		}
		try {
			const channel = await this.chatService.getChannelData(channelId);
			const message = await this.chatService.punishUser(channel, adminId, userId, type);
			const chatUser = this.chatUsers.getUserById(userId.toString());

			this.server.to(client.id).emit('userPunished');
			if (chatUser) {
				this.server.to(chatUser.socketId).emit('punishedInChannel', message);
			}
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
		@MessageBody() { userId }: { userId: number }
	) {
		const dms = await this.chatService.getUserDms(userId);

		for (const dm of dms) {
			this.userJoinRoom(client.id, `dm_${dm.id}`);
		}
		this.server.to(client.id).emit('updateUserDms', (dms));
	}

	@SubscribeMessage('getDmData')
	async handleDmData(
		@ConnectedSocket() client: Socket,
		@MessageBody() { dmId }: { dmId: number }
	) {
		const dm = await this.chatService.getDmData(dmId);
		const roomId = `dm_${dm.id}`;

		this.userJoinRoom(client.id, roomId);
		this.server.to(client.id).emit('updateDm', (dm));
	}

	@UseFilters(new BadRequestTransformationFilter())
	@SubscribeMessage('createDm')
	async handleCreateDm(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: CreateDirectMessageDto
	) {
		try {
			let dm = await this.chatService.checkIfDmExists(
				data.users[0].id.toString(),
				data.users[1].id.toString()
			);

			if (!dm) {
				dm = await this.chatService.createDm(data);

				const user = this.chatUsers.getUser(client.id);
				const friend = data.users.find((dmUser) => dmUser.id !== user.id);
				const friendUser = this.chatUsers.getUserById(friend.id.toString());

				if (friendUser) {
					this.userJoinRoom(friendUser.socketId, `dm_${dm.id}`);
					this.server.to(friendUser.socketId).emit('dmCreated');
				}
			}
			this.userJoinRoom(client.id, `dm_${dm.id}`);
			this.server.to(client.id).emit('openCreatedDm', (dm));
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
		if (data.type || data.roomId) {
			throw new WsException('Unauthorized operation.');
		}
		try {
			const message = await this.chatService.addMessageToDm(data);

			this.server.to(`dm_${message.dm.id}`).emit('newDm', { message });
			this.logger.log(`New message in DM [${message.dm.id}]`);
		} catch (e) {
			this.server.to(client.id).emit('chatError', e.message);
		}
	}
}
