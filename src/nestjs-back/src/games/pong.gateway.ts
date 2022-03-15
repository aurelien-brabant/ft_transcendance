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
import { User } from "src/users/entities/users.entity";

// import { GamesService } from './games.service';
import { CreateGameDto } from 'src/games/dto/create-game.dto';
import { UpdateGameDto } from 'src/games/dto/update-game.dto';
import Queue from './class/Queue';
import Room from './class/Room';

@WebSocketGateway({ cors: true })
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor() {}
	// private gamesService: GamesService
	@WebSocketServer()
	server: Server;
	private logger: Logger = new Logger('gameGateway');
    private readonly queue: Queue<string> = new Queue();
    private readonly rooms: Map<string, Room> = new Map()

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
            // function below will update room state and emit changes to players
            // this.updateRoomState();
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
	}

	@SubscribeMessage('joinQueue')
	handleJoinQueue(@ConnectedSocket() client: Socket) {
		this.queue.enqueue(client.id);
		this.server.to(client.id).emit("addedToQueue");
		this.logger.log(`Client ${client.id} was added to queue !`);
	}

	@SubscribeMessage('joinRoom')
	handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
		this.logger.log(`Client ${client.id} was added to room: ${room} !`);
		client.join(room);
		this.server.to(client.id).emit("joinedRoom");
	}

	@SubscribeMessage('Up')
	async handleKeyUp(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
		this.logger.log(`Client ${client.id} moved Up in game: ${roomId}!`);
		// this.room[roomId].update(client.id, "up");
		// this.room[roomId].update(client.id, "up");
	}

	@SubscribeMessage('Down')
	async handlekeyDown(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
		this.logger.log(`Client ${client.id} moved Down in game: ${roomId}!`);
		// this.room[roomId].update(client.id, "down");
		// this.room[roomId].update(client.id, "down");
	}
}
