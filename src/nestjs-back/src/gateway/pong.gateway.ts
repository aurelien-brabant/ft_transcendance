
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

@WebSocketGateway({ cors: true })
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('gameGateway');

  afterInit(server: Server) {
	  this.logger.log('Init');
  }

  handleConnection(@ConnectedSocket() client: Socket) {
  	this.logger.log(`Client connected: ${client.id}`);
	this.server.emit("connected");
  }

  handleDisconnect(client: Socket) {
  	this.logger.log(`Client disconnected: ${client.id}`);
  }


  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string): void {
	  this.logger.log("a message has been received");
    this.server.emit('message', message);
  }
}
