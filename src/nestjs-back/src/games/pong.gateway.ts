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
import Room from './class/Room';
import { ConnectedUsers, User } from './class/ConnectedUsers';
import { GameMode, GameState, UserStatus } from './class/Constants';

@WebSocketGateway({ cors: true, namespace: "game", transports: ['websocket']})
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly gamesService: GamesService,
		private readonly usersService: UsersService
	) {}

	@WebSocketServer()
	server: Server;

	private logger: Logger = new Logger('gameGateway');

	private readonly queue: Queue = new Queue();
	private readonly rooms: Map<string, Room> = new Map();
	private readonly currentGames: Array<string> = new Array();
	private readonly connectedUsers: ConnectedUsers = new ConnectedUsers();

	createNewRoom(players: User[]): void {
		let roomId: string;
		let room: Room;

		roomId = `${players[0].username}&${players[1].username}`;
				
		room = new Room(roomId, players, {mode: players[0].mode});
		
		this.server.to(players[0].socketId).emit("newRoom", room);
		this.server.to(players[1].socketId).emit("newRoom",  room);
		this.rooms.set(roomId, room);
		this.currentGames.push(roomId);
		this.server.emit("updateCurrentGames", this.currentGames);
	}
	
	afterInit(server: Server) {
		setInterval(() => {
			if (this.queue.size() > 1) { // && this.currentGames.length < MAX_SIMULTANEOUS_GAMES
				let players: User[] = Array();

				players = this.queue.matchPlayers();
				if (players.length === 0)
					return ;
				this.createNewRoom(players);
			}
		}, 5000);
		this.logger.log(`Init Pong Gateway`);
	}

	async handleConnection(@ConnectedSocket() client: Socket) {
		// this.logger.log(`Client connected: ${client.id}`);
	}

	@SubscribeMessage('handleUserConnect')
	async handleUserConnect(@ConnectedSocket() client: Socket, @MessageBody() user: User) {
		let newUser: User = new User(user.id, user.username, client.id, user.ratio);
		newUser.setSocketId(client.id);
		newUser.setUserStatus(UserStatus.INHUB);

		// Verify that player is not already in a game
		this.rooms.forEach((room: Room) => {
			if (room.isAPlayer(newUser) && room.gameState !== GameState.PLAYERONEWIN || room.gameState !== GameState.PLAYERTWOWIN)
			{
				newUser.setUserStatus(UserStatus.PLAYING);
				newUser.setRoomId(room.roomId);
				this.server.to(client.id).emit("newRoom", room);
				if (room.gameState === GameState.PAUSED)
					room.resume();
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

						let roomIndex: number = this.currentGames.findIndex(roomIdRm => roomIdRm === room.roomId);
						if (roomIndex !== -1)
							this.currentGames.splice(roomIndex, 1);
						this.server.emit("updateCurrentGames", this.currentGames);
					}
					else if (room.gameState !== GameState.PLAYERONEWIN && room.gameState !== GameState.PLAYERTWOWIN) {
						if (room.gameState === GameState.PLAYERONESCORED || room.gameState === GameState.PLAYERTWOSCORED)
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

	@SubscribeMessage('joinQueue')
	handleJoinQueue(@ConnectedSocket() client: Socket, @MessageBody() mode: string) {
		let user: User = this.connectedUsers.getUser(client.id);

		if (user && !this.queue.isInQueue(user))
		{
			this.connectedUsers.changeUserStatus(client.id, UserStatus.INQUEUE);
			this.connectedUsers.setGameMode(client.id, mode);
			this.queue.enqueue(user);
			this.server.to(client.id).emit('joinedQueue');
			this.logger.log(`Client ${user.username}: ${client.id} was added to queue !`);
		}
	}

	@SubscribeMessage('leaveQueue')
	handleLeaveQueue(@ConnectedSocket() client: Socket) {
		let user: User = this.connectedUsers.getUser(client.id);

		if (user && this.queue.isInQueue(user))
		{
			this.queue.remove(user);
			this.server.to(client.id).emit('leavedQueue');
		}
	}

	@SubscribeMessage('spectateRoom')
	handleSpectateRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
		const room: Room = this.rooms.get(roomId);

		if (room) {
			let user = this.connectedUsers.getUser(client.id);
			if (!room.isAPlayer(user))
				this.server.to(client.id).emit("newRoom", room);
		}
	}

	@SubscribeMessage('joinRoom')
	handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
		const room: Room = this.rooms.get(roomId);

		if (room) {
			let user = this.connectedUsers.getUser(client.id);
			client.join(roomId);
			if (user.status === UserStatus.INHUB)
				this.connectedUsers.changeUserStatus(client.id, UserStatus.SPECTATING);
			else if (room.isAPlayer(user))
				room.addUser(user);
			this.server.to(client.id).emit("joinedRoom");
			this.server.to(client.id).emit("updateRoom", JSON.stringify(room.serialize()));
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

				let roomIndex: number = this.currentGames.findIndex(roomIdRm => roomIdRm === room.roomId);
				if (roomIndex !== -1)
					this.currentGames.splice(roomIndex, 1);
				this.server.emit("updateCurrentGames", this.currentGames);
			}
			if (room.isAPlayer(user) && room.gameState !== GameState.PLAYERONEWIN && room.gameState !== GameState.PLAYERTWOWIN)
				room.pause();
			client.leave(room.roomId);
			this.connectedUsers.changeUserStatus(client.id, UserStatus.INHUB);
		}
		this.server.to(client.id).emit("leavedRoom");
	}

	async saveGame(room: Room, currentTimestamp: number){
		let winnerId, loserId, winnerScore, loserScore: number;

		if (room.gameState === GameState.PLAYERONEWIN) {
			winnerId = room.playerOne.user.id;
			loserId = room.playerTwo.user.id;
			winnerScore = room.playerOne.goal;
			loserScore = room.playerTwo.goal;
		}
		else if (room.gameState === GameState.PLAYERTWOWIN) {
			winnerId = room.playerTwo.user.id;
			loserId = room.playerOne.user.id;
			winnerScore = room.playerTwo.goal;
			loserScore = room.playerOne.goal;
		}

		const winner = await this.usersService.findOne(String(winnerId));
		const loser = await this.usersService.findOne(String(loserId));

		/* Update users wins/losses/draws and ratio */
		const isDraw: boolean = false; // This is not used but may be one day
		await this.usersService.updateStats(winner, isDraw, true);
		await this.usersService.updateStats(loser, isDraw, false);

		/* Save game in database */
		let test = await this.gamesService.create({
			players: [winner, loser],
			winnerId: winnerId,
			loserId: loserId,
			createdAt: new Date(room.timestampStart),
			endedAt: new Date(currentTimestamp),
			gameDuration: room.getDuration(),
			winnerScore: winnerScore,
			loserScore: loserScore,
			mode: room.mode
		});
		let roomIndex: number = this.currentGames.findIndex(roomIdRm => roomIdRm === room.roomId);
		if (roomIndex !== -1)
			this.currentGames.splice(roomIndex, 1);
		this.server.emit("updateCurrentGames", this.currentGames);
	}

	secondToTimestamp(second: number): number{
		return (second * 1000);
	}

	@SubscribeMessage('requestUpdate')
	async handleRequestUpdate(@MessageBody() roomId: string) {
		const room: Room = this.rooms.get(roomId);

		if (room) {
			let currentTimestamp: number = Date.now();

			if (room.gameState === GameState.STARTING
					&& (currentTimestamp - room.timestampStart) >= this.secondToTimestamp(3.5)) {
				room.start();
			}
			else if (room.gameState === GameState.PLAYING)
			{
				room.update(currentTimestamp);
				if (room.isGameEnd)
					this.saveGame(room, currentTimestamp);
			}
			else if ((room.gameState === GameState.PLAYERONESCORED || room.gameState === GameState.PLAYERTWOSCORED)
					&& (currentTimestamp - room.goalTimestamp) >= this.secondToTimestamp(3.5)) {
				room.resetPosition();
				room.changeGameState(GameState.PLAYING);
				room.lastUpdate = Date.now();
			} else if (room.gameState === GameState.RESUMED
					&& (currentTimestamp - room.pauseTime[room.pauseTime.length - 1].resume) >= this.secondToTimestamp(3.5)) {
				room.lastUpdate = Date.now();
				room.changeGameState(GameState.PLAYING);
			} else if (room.gameState === GameState.PAUSED
					&& (currentTimestamp - room.pauseTime[room.pauseTime.length - 1].pause) >= this.secondToTimestamp(42)) {
				room.pauseForfait();
				room.pauseTime[room.pauseTime.length - 1].resume = Date.now();
				this.saveGame(room, currentTimestamp);
			}

			if (room.mode === GameMode.TIMER && (room.gameState === GameState.PLAYERONESCORED || room.gameState === GameState.PLAYERTWOSCORED || room.gameState === GameState.PLAYING))
				room.updateTimer();

			this.server.to(room.roomId).emit("updateRoom", JSON.stringify(room.serialize()));
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


	@SubscribeMessage('getCurrentGames')
	handleCurrentGames(@ConnectedSocket() client: Socket) {
		this.server.to(client.id).emit("updateCurrentGames", (this.currentGames));
	}
}
