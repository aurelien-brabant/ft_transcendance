import { Module } from '@nestjs/common';
import { ChatGateway } from 'src/chat/chat.gateway';
import { PongGateway } from './pong.gateway';

@Module({
  providers: [ChatGateway, PongGateway]
})
export class GatewayModule {}
