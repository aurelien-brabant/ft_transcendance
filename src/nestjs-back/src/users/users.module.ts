import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Games } from 'src/games/entities/games.entity';
import { Users } from './entities/users.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [TypeOrmModule.forFeature([Users, Games])], 
    controllers: [UsersController], 
    providers: [UsersService],
    exports: [UsersService]
})
export class UsersModule {}
