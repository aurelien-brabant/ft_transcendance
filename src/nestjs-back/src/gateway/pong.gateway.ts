import { Socket, Server } from 'socket.io';
import {
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	MessageBody,
	OnGatewayInit,
	OnGatewayConnection,
	OnGatewayDisconnect,
	ConnectedSocket,
	WsResponse
} from '@nestjs/websockets';
import { Logger } from "@nestjs/common"

@WebSocketGateway({
	cors: {
		origin: '*',
		methods: ["GET", "POST"]
	},
})
export class PongGateway implements  OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	server: Server;
	private logger: Logger = new Logger('gameGateway');

	afterInit(server: Server) {
		this.logger.log('Init');
	}

	handleDisconnect(client: Socket) {
		console.log(`Client disconnected: ${client.id}`);
	}

	handleConnection(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		this.logger.log(`Client connected: ${client.id}`);
		this.server.emit('connect');
		return { event: 'connect', text: 'Hello World'};
	}

	@SubscribeMessage('hello')
	handleHello(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
		this.logger.log(`Client ${client.id} said `, data);
		this.server.emit('connect');
	}

}
