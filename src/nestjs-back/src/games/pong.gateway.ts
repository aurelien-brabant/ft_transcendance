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
import Room, { GameState, IRoom } from './class/Room';

@WebSocketGateway({ cors: true })
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor() {}

	@WebSocketServer()
	server: Server;
	private logger: Logger = new Logger('gameGateway');
    private readonly queue: Queue<string> = new Queue();
    private readonly rooms: Map<string, Room> = new Map();

	findMatches(server: Server, queue: Queue<string>, rooms: Map<string, Room>) {
		if (queue.size() > 1) {
			let players: string[] = Array();
            let room: Room;
			
			players.push(queue.dequeue());			
			players.push(queue.dequeue());
			
			let roomId: string = `${players[0]}&${players[1]}`
            room = new Room(roomId, players);

			server.to(players[0]).emit("newRoom", room);
			server.to(players[1]).emit("newRoom",  room);
            rooms.set(roomId, room);
        }
    }

	afterInit(server: Server) {
		setInterval(this.findMatches, 5000, this.server, this.queue, this.rooms);
	}

	async handleConnection(@ConnectedSocket() client: Socket) {
		this.logger.log(`Client connected: ${client.id}`);
	}

	async handleDisconnect(@ConnectedSocket() client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
		for (let room of this.rooms.values()) {
			if (room.playerOne.id === client.id || room.playerTwo.id === client.id)
			{
				if (room.gameState === GameState.PLAYING)
					room.changeGameState(GameState.PAUSED);
				else if (room.gameState === GameState.PAUSED)
				{
					this.logger.log("No player left in the room deleting it...");
					this.rooms.delete(room.id);
				}
			}
		}
		this.queue.remove(client.id);
	}

	// Etape 1 : Player JoinQueue
	@SubscribeMessage('joinQueue')
	handleJoinQueue(@ConnectedSocket() client: Socket) {
		this.queue.enqueue(client.id);
		this.logger.log(`Client ${client.id} was added to queue !`);
	}

	// Etape 2 : The player was assigned a Room and received the roomId we add him to the room
	@SubscribeMessage('joinRoom')
	handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
		client.join(room);
		this.server.to(client.id).emit("joinedRoom");
	}

	// Etape 3 : Players ask for the last room Updates
	@SubscribeMessage('requestUpdate')
	handleRequestUpdate(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
		const room: Room = this.rooms.get(roomId);

		if (room.gameState === GameState.PLAYING)
			room.update();
		else if (room.gameState === GameState.GOAL && (Date.now() - room.goalTimestamp) >= 3500)
		{
			room.resetPosition();
			room.changeGameState(GameState.PLAYING);
			room.lastUpdate = Date.now();
		}
		this.server.to(client.id).emit("updateRoom", room);
	}

	// Controls
	@SubscribeMessage('keyDown')
	async handleKeyUp(@ConnectedSocket() client: Socket, @MessageBody() data: {roomId: string, key: string}) {
		const room: Room = this.rooms.get(data.roomId);

		if (room.playerOne.id === client.id)
		{
			if (data.key === 'ArrowUp')
				room.playerOne.up = true;
			if (data.key === 'ArrowDown')
				room.playerOne.down = true;

		}
		else if (room.playerTwo.id === client.id)
		{
			if (data.key === 'ArrowUp')
				room.playerTwo.up = true;
			if (data.key === 'ArrowDown')
				room.playerTwo.down = true;
		}
	}

	@SubscribeMessage('keyUp')
	async handleKeyDown(@ConnectedSocket() client: Socket, @MessageBody() data: {roomId: string, key: string}) {
		const room: Room = this.rooms.get(data.roomId);

		if (room.playerOne.id === client.id)
		{
			if (data.key === 'ArrowUp')
				room.playerOne.up = false;
			if (data.key === 'ArrowDown')
				room.playerOne.down = false;

		}
		else if (room.playerTwo.id === client.id)
		{
			if (data.key === 'ArrowUp')
				room.playerTwo.up = false;
			if (data.key === 'ArrowDown')
				room.playerTwo.down = false;
		}
	}
}
