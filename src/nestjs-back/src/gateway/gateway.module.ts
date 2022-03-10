import { Module } from '@nestjs/common';
import { PongGateway } from './pong.gateway';
import { ChatGateway } from '../chat/chat.gateway';

@Module({ providers: [PongGateway, ChatGateway] })
export class GatewayModule {}
