import { Socket, Server } from 'socket.io';
import { Logger } from "@nestjs/common"
import {
	MessageBody,
	OnGatewayInit,
	OnGatewayConnection,
	OnGatewayDisconnect,
	ConnectedSocket,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from "@nestjs/websockets";
import { GamesService } from './games.service';
import { UsersService } from 'src/users/users.service';

import Queue from './class/Queue';
import Room, { ConnectedUsers, GameState, User, userStatus } from './class/Room';

@WebSocketGateway({ cors: true })
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(private readonly gamesService: GamesService,
				private readonly usersService: UsersService) {}

	@WebSocketServer()
	server: Server;
	private logger: Logger = new Logger('gameGateway');
    private readonly queue: Queue = new Queue();
    private readonly rooms: Map<string, Room> = new Map();

	// see if it can be done another way
	private readonly connectedUsers: ConnectedUsers = new ConnectedUsers();

	async findMatches(server: Server, queue: Queue, rooms: Map<string, Room>) {
		if (queue.size() > 1) {
			let players: User[] = Array();
			let roomId: string;
            let room: Room;

			players.push(queue.dequeue());
			// Match players based on ratio, etc...
			players.push(queue.dequeue());

			// emit rooms change event for spectator or create a game in DB
			// server.emit("updateCurrentGames", rooms);

			roomId = `${players[0].username}&${players[1].username}`;
            room = new Room(roomId, players, {maxGoal: 1});
			server.to(players[0].socketId).emit("newRoom", room);
			server.to(players[1].socketId).emit("newRoom",  room);
            rooms.set(roomId, room);
        }
    }

	afterInit(server: Server) {
		setInterval(this.findMatches, 5000, this.server, this.queue, this.rooms);
	}

	async handleConnection(@ConnectedSocket() client: Socket) {
		this.logger.log(`Client connected: ${client.id}`);
	}

	@SubscribeMessage('handleUserConnect')
	handlUserConnect(@ConnectedSocket() client: Socket, @MessageBody() user: User) {
		let newUser: User = new User(user.id, user.username, client.id);
		newUser.setSocketId(client.id);
		newUser.setUserStatus(userStatus.INHUB);

		// Verify that player is not already in a game
		this.rooms.forEach((room: Room) => {
			if (room.isAPlayer(newUser) && room.gameState !== GameState.END)
			{
				newUser.setUserStatus(userStatus.PLAYING);
				newUser.setRoomId(room.roomId);
				this.server.to(client.id).emit("newRoom", room);
				if (room.gameState === GameState.PAUSED)
				{
					room.changeGameState(GameState.RESUMED);
					room.pauseTime[room.pauseTime.length - 1].resume = Date.now();
				}
				return ;
			}
		});
		this.connectedUsers.addUser(newUser);
	}

	async handleDisconnect(@ConnectedSocket() client: Socket) {
		let user: User = this.connectedUsers.getUser(client.id);

		if (user) {
			this.rooms.forEach((room: Room) => {
				if (room.isAPlayer(user))
				{
					room.removeUser(user);
					if (room.players.length === 0)
					{
						this.logger.log("No player left in the room deleting it...");
						this.rooms.delete(room.roomId);
					}
					else if (room.gameState !== GameState.END) {
						if (room.gameState === GameState.GOAL)
							room.resetPosition();
						room.pause();
					}
					client.leave(room.roomId);
					return ;
				}
			});

			// remove from queue and connected user
			this.queue.remove(user);
			this.logger.log(`Client ${user.username} disconnected: ${client.id}`);
			this.connectedUsers.removeUser(user);
		}
	}

	// Etape 1 : Player JoinQueue
	@SubscribeMessage('joinQueue')
	handleJoinQueue(@ConnectedSocket() client: Socket) {
		let user: User = this.connectedUsers.getUser(client.id);

		if (user && !this.queue.isInQueue(user))
		{
			this.connectedUsers.changeUserStatus(client.id, userStatus.INQUEUE);
			this.queue.enqueue(user);
			this.server.to(client.id).emit('joinedQueue');
			this.logger.log(`Client ${user.username}: ${client.id} was added to queue !`);
		}
	}

	// Etape 1 : Player JoinQueue
	@SubscribeMessage('leaveQueue')
	handleLeaveQueue(@ConnectedSocket() client: Socket) {
		let user: User = this.connectedUsers.getUser(client.id);

		// check if user is in queue
		if (user && this.queue.isInQueue(user))
		{
			this.queue.remove(user);
			this.server.to(client.id).emit('leavedQueue');
		}
	}

	@SubscribeMessage('spectateRoom')
	handleSpectateRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
		const room: Room = this.rooms.get(roomId);
		this.logger.log("User tried to join: ", roomId);

		if (room) {
			let user = this.connectedUsers.getUser(client.id);
			if (!room.isAPlayer(user))
				this.server.to(client.id).emit("newRoom", room);
		}
	}

	// Etape 2 : The player was assigned a Room and received the roomId we add him to the room
	@SubscribeMessage('joinRoom')
	handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
		const room: Room = this.rooms.get(roomId);

		if (room) {
			let user = this.connectedUsers.getUser(client.id);
			client.join(roomId);
			if (user.status === userStatus.INHUB) {
				this.connectedUsers.changeUserStatus(client.id, userStatus.SPECTATING);
			}
			else if (room.isAPlayer(user))
				room.addUser(user);
			this.server.to(client.id).emit("joinedRoom");
			this.server.to(client.id).emit("updateRoom", room);
		}
	}


	@SubscribeMessage('leaveRoom')
	handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
		const room: Room = this.rooms.get(roomId);
		let user: User = this.connectedUsers.getUser(client.id);

		if (user && room) {
			room.removeUser(user);
			if (room.players.length === 0) {
				this.logger.log("No user left in the room deleting it...");
				this.rooms.delete(room.roomId);
			}
			if (room.isAPlayer(user) && room.gameState !== GameState.END)
				room.pause();
			client.leave(room.roomId);
			this.connectedUsers.changeUserStatus(client.id, userStatus.INHUB);
		}
		this.server.to(client.id).emit("leavedRoom");
	}

	// Etape 3 : Players ask for the last room Updates
	@SubscribeMessage('requestUpdate')
	async handleRequestUpdate(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
		const room: Room = this.rooms.get(roomId);

		if (room) {
			let currentTimestamp = Date.now();
			if (room.gameState === GameState.STARTING && (currentTimestamp - room.timestampStart) >= 3500) {
				room.timestampStart = Date.now();
				room.lastUpdate = Date.now();
				room.changeGameState(GameState.PLAYING);
			}
			else if (room.gameState === GameState.PLAYING)
			{
				room.update();
				if (room.isGameEnd) {
					let playerOne = await this.usersService.findOne(String(room.players[0].id));
					let playerTwo = await this.usersService.findOne(String(room.players[1].id));
					let game = await this.gamesService.create({
						players: [playerOne, playerTwo],
						winnerId: room.winnerId,
						loserId: room.loserId,
						createdAt: new Date(room.timestampStart),
						endedAt: new Date(currentTimestamp),
						gameDuration: room.getDuration(),
						winnerScore: room.winnerScore,
						loserScore: room.loserScore
					});
					console.log(game);	
				}
			}
			else if (room.gameState === GameState.GOAL && (currentTimestamp - room.goalTimestamp) >= 3500) {
				room.resetPosition();
				room.changeGameState(GameState.PLAYING);
				room.lastUpdate = Date.now();
			} else if (room.gameState === GameState.RESUMED && (currentTimestamp - room.pauseTime[room.pauseTime.length - 1].resume) >= 3500) {
				room.lastUpdate = Date.now();
				room.changeGameState(GameState.PLAYING);
			}

			this.server.to(room.roomId).emit("updateRoom", room);
		}
	}

	// Controls
	@SubscribeMessage('keyDown')
	async handleKeyUp(@ConnectedSocket() client: Socket, @MessageBody() data: {roomId: string, key: string, username: string}) {
		const room: Room = this.rooms.get(data.roomId);

		if (room && room.playerOne.user.username === data.username)
		{
			if (data.key === 'ArrowUp')
				room.playerOne.up = true;
			if (data.key === 'ArrowDown')
				room.playerOne.down = true;

		}
		else if (room && room.playerTwo.user.username === data.username)
		{
			if (data.key === 'ArrowUp')
				room.playerTwo.up = true;
			if (data.key === 'ArrowDown')
				room.playerTwo.down = true;
		}
	}

	@SubscribeMessage('keyUp')
	async handleKeyDown(@ConnectedSocket() client: Socket, @MessageBody() data: {roomId: string, key: string, username: string}) {
		const room: Room = this.rooms.get(data.roomId);

		if (room && room.playerOne.user.username === data.username)
		{
			if (data.key === 'ArrowUp')
				room.playerOne.up = false;
			if (data.key === 'ArrowDown')
				room.playerOne.down = false;

		}
		else if (room && room.playerTwo.user.username === data.username)
		{
			if (data.key === 'ArrowUp')
				room.playerTwo.up = false;
			if (data.key === 'ArrowDown')
				room.playerTwo.down = false;
		}
	}
}
