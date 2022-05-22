import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Game } from './entities/games.entity';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { PongGateway } from './pong.gateway';

@Module({
    imports: [TypeOrmModule.forFeature([Game]), UsersModule], 
    controllers: [GamesController],
    providers: [GamesService, PongGateway],
    exports: [PongGateway]
})
export class GamesModule {}
