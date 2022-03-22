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
// Not yet in place
// import { User } from "src/users/entities/users.entity";
// import { GamesService } from './games.service';
// import { CreateGameDto } from 'src/games/dto/create-game.dto';
// import { UpdateGameDto } from 'src/games/dto/update-game.dto';

import Queue from './class/Queue';
import Room, { GameState, User } from './class/Room';

@WebSocketGateway({ cors: true })
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor() {}

	@WebSocketServer()
	server: Server;
	private logger: Logger = new Logger('gameGateway');
    private readonly queue: Queue = new Queue();
    private readonly rooms: Map<string, Room> = new Map();
	private readonly connectedUser: User[] = new Array();

	findMatches(server: Server, queue: Queue, rooms: Map<string, Room>) {
		if (queue.size() > 1) {
			let players: User[] = Array();
            let room: Room;

			players.push(queue.dequeue());
			players.push(queue.dequeue());

			let roomId: string = `${players[0].username}&${players[1].username}`
            room = new Room(roomId, players, {maxGoal: 3});

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
		this.connectedUser.push({id: user.id, username: user.username, socketId: client.id});
		// Verify that player is not already in a game
		for (let room of this.rooms.values()) {
			let users: User[] = room.getUsers();
			if (users[0].username === user.username || users[1].username === user.username)
			{
				this.server.to(client.id).emit("newRoom", room);
				if (room.gameState === GameState.PAUSED)
				{
					room.changeGameState(GameState.RESUMED);
					room.pauseTime[room.pauseTime.length - 1].resume = Date.now();
				}
			}
		}
	}

	async handleDisconnect(@ConnectedSocket() client: Socket) {
		let userIndex: number = this.connectedUser.findIndex(user => user.socketId === client.id);

		if (userIndex !== -1) {
			let username: string = this.connectedUser[userIndex].username;
			for (let room of this.rooms.values()) {
				let users: User[] = room.getUsers();
				if (users[0].username === username || users[1].username === username)
				{
					if (room.gameState === GameState.PAUSED)
					{
						this.logger.log("No player left in the room deleting it...");
						this.rooms.delete(room.id);
					}
					else if (room.gameState !== GameState.END) {
						room.changeGameState(GameState.PAUSED);
						room.pauseTime.push({pause: Date.now(), resume: 0});
					}
					client.leave(room.id);
				}
			}
			// remove from queue and connected user
			if (this.queue.find(username) !== undefined)
				this.queue.remove(username);
			this.connectedUser.splice(userIndex, 1);
			this.logger.log(`Client ${username} disconnected: ${client.id}`);
		}
	}

	// Etape 1 : Player JoinQueue
	@SubscribeMessage('joinQueue')
	handleJoinQueue(@ConnectedSocket() client: Socket, @MessageBody() user: User) {
		// check if not already in queue
		if (this.queue.find(user.username) === undefined)
		{
			this.queue.enqueue({id: user.id, username: user.username, socketId: client.id});
			this.server.to(client.id).emit('joinedQueue');
			this.logger.log(`Client ${user.username}: ${client.id} was added to queue !`);
		}
	}

	// Etape 1 : Player JoinQueue
	@SubscribeMessage('leaveQueue')
	handleLeaveQueue(@ConnectedSocket() client: Socket, @MessageBody() user: User) {
		// check if user is in queue
		if (this.queue.find(user.username) !== undefined)
		{
			this.queue.remove(user.username);
			this.server.to(client.id).emit('leavedQueue');
		}
	}

	// Etape 2 : The player was assigned a Room and received the roomId we add him to the room
	@SubscribeMessage('joinRoom')
	handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
		const room: Room = this.rooms.get(roomId);

		client.join(roomId);
		this.server.to(client.id).emit("joinedRoom");
		this.server.to(client.id).emit("updateRoom", room);
	}


	@SubscribeMessage('leaveRoom')
	handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
		const room: Room = this.rooms.get(roomId);

		client.leave(roomId);
		this.logger.log(`Client ${client.id} leaved room ${roomId} !`);
		this.server.to(client.id).emit("leaveRoom");
	}

	// Etape 3 : Players ask for the last room Updates
	@SubscribeMessage('requestUpdate')
	handleRequestUpdate(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
		const room: Room = this.rooms.get(roomId);

		if (room.gameState === GameState.STARTING && (Date.now() - room.timestampStart) >= 3500)
		{
			room.timestampStart = Date.now();
			room.lastUpdate = Date.now();
			room.changeGameState(GameState.PLAYING);
		}
		else if (room.gameState === GameState.PLAYING)
			room.update();
		else if (room.gameState === GameState.GOAL && (Date.now() - room.goalTimestamp) >= 3500) {
			room.resetPosition();
			room.changeGameState(GameState.PLAYING);
			room.lastUpdate = Date.now();
		} else if (room.gameState === GameState.RESUMED && (Date.now() - room.pauseTime[room.pauseTime.length - 1].resume) >= 3500)
		{
			room.lastUpdate = Date.now();
			room.changeGameState(GameState.PLAYING);
		}
		this.server.to(room.id).emit("updateRoom", room);
	}

	// Controls
	@SubscribeMessage('keyDown')
	async handleKeyUp(@ConnectedSocket() client: Socket, @MessageBody() data: {roomId: string, key: string, username: string}) {
		const room: Room = this.rooms.get(data.roomId);

		if (room.playerOne.user.username === data.username)
		{
			if (data.key === 'ArrowUp')
				room.playerOne.up = true;
			if (data.key === 'ArrowDown')
				room.playerOne.down = true;

		}
		else if (room.playerTwo.user.username === data.username)
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

		if (room.playerOne.user.username === data.username)
		{
			if (data.key === 'ArrowUp')
				room.playerOne.up = false;
			if (data.key === 'ArrowDown')
				room.playerOne.down = false;

		}
		else if (room.playerTwo.user.username === data.username)
		{
			if (data.key === 'ArrowUp')
				room.playerTwo.up = false;
			if (data.key === 'ArrowDown')
				room.playerTwo.down = false;
		}
	}
}
