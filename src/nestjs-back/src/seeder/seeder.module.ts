import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Games } from 'src/games/entities/games.entity';
import { GamesService } from 'src/games/games.service';
import { UsersService } from 'src/users/users.service';
import { Users } from '../users/entities/users.entity';
import { UsersModule } from '../users/users.module';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Users, Games])],
  providers: [SeederService, UsersService, GamesService],
  exports: [SeederModule]
})
export class SeederModule {}