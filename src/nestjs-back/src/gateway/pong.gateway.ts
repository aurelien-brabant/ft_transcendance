
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

interface IQueue<T> {
  enqueue(item: T): void;
  dequeue(): T | undefined;
  size(): number;
  find(item: T): T;
}

class Queue<T> implements IQueue<T> {
  private storage: T[] = [];

  constructor(private capacity: number = Infinity) {}

  enqueue(item: T): void {
    if (this.size() === this.capacity) {
      throw Error("Queue has reached max capacity, you cannot add more items");
    }
    this.storage.push(item);
  }
  dequeue(): T | undefined {
    return this.storage.shift();
  }
  size(): number {
    return this.storage.length;
  }
  find(item: T): T {
	  return this.storage.find(el => el === item);
  }
}

@WebSocketGateway({ cors: true })
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;
	private logger: Logger = new Logger('gameGateway');
	private queue: Queue<any> = new Queue();

	findMatches(queue: Queue<any>, logger: Logger, server: Server) {
		// This function will be and needs to be reworked
		if (queue.size() > 1) {
			logger.log("Matching players...");
			// Add matchmaking system
			// get first_player ratio and stats to match the best player in the queue
			let first_player: any = queue.dequeue();
			let second_player: any = queue.dequeue();

			// Create a socket room for the match
			let roomId: string = `${first_player.id}&${second_player.id}`
			logger.log(`New game room at: ${roomId}`);

			server.to(first_player.id).emit("roomId", roomId);
			server.to(second_player.id).emit("roomId",  roomId);
		}
	}

	afterInit(server: Server) {
		this.logger.log('Init');
		setInterval(this.findMatches, 5000, this.queue, this.logger, this.server);
	}

	async handleConnection(@ConnectedSocket() client: Socket) {
		this.logger.log(`Client connected: ${client.id}`);
	}

	async handleDisconnect(@ConnectedSocket() client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	@SubscribeMessage('joinQueue')
	handleJoinQueue(@ConnectedSocket() client: Socket) {
		this.logger.log(`Client ${client.id} was added to queue !`);

		this.queue.enqueue({id: client.id, socket: client});
		this.server.to(client.id).emit("addedToQueue");
	}

	@SubscribeMessage('joinRoom')
	handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
		this.logger.log(`Client ${client.id} was added to room: ${room} !`);

		client.join(room);
		this.server.to(room).emit("joinedRoom", `Client ${client.id} just joined the room`);
	}

	@SubscribeMessage('message')
	handleMessage(@MessageBody() message: string): void {
		this.logger.log("A message has been received");
		this.server.emit('message', message);
	}
}
