import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './entities/games.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@Injectable()
export class GamesService {

    constructor(
        @InjectRepository(Game)
        private readonly gamesRepository: Repository<Game>,
    ) {}

    findAll() {
        return this.gamesRepository.find({
            order: {
                endedAt: 'DESC'
            }
        });
    }

    async findOne(id: string) { 
        const game =  await this.gamesRepository.findOne(id);
        if (!game)
            throw new NotFoundException(`Game [${id}] not found`);
        return game;
    }

    async create(createGameDto: CreateGameDto) {
        const game = this.gamesRepository.create({...createGameDto});
        return this.gamesRepository.save(game);
    }

    async update(id: string, updateGameDto: UpdateGameDto) { 
        
        const game = await this.gamesRepository.preload({
            id: +id,
            ...updateGameDto,
        });
        if (!game)
            throw new NotFoundException(`Cannot update game[${id}]: Not found`);
        return this.gamesRepository.save(game);
    }

    async remove(id: string) { 
        const game = await this.findOne(id);
        return this.gamesRepository.remove(game);
    }
}