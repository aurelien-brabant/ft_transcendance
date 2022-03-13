
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
  private queue: Queue<string> = new Queue();

  afterInit(server: Server) {
	  this.logger.log('Init');
  }

  handleConnection(@ConnectedSocket() client: Socket) {
  	this.logger.log(`Client connected: ${client.id}`);
	// this.server.emit("connected");
  }

  handleDisconnect(client: Socket) {
  	this.logger.log(`Client disconnected: ${client.id}`);
  }

	@SubscribeMessage('join')
	handleJoin(client: Socket) {
		this.logger.log(`Client ${client.id} wants to find a match !`);
		this.queue.enqueue(client.id);
		this.logger.log(this.queue.size());
		this.logger.log(this.queue.find(client.id));
	}

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string): void {
	  this.logger.log("A message has been received");
    this.server.emit('message', message);
  }
}
