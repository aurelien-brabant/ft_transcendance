import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
//import { UpdateGameDto } from './dto/update-game.dto';
import { Games } from './entities/games.entity';

@Injectable()
export class GamesService {

    constructor(
        @InjectRepository(Games)
        private readonly gamesRepository: Repository<Games>,
    ) {}

    findAll() {
        return this.gamesRepository.find();
    }

    async findOne(id: string) { 
            const game =  await this.gamesRepository.findOne(id);
        if (!game)
            throw new NotFoundException(`Game [${id}] not found`);
        return game;
    }

    create(createGameDto: CreateGameDto) {
        const game = this.gamesRepository.create(createGameDto);
        return this.gamesRepository.save(game);
    }
 /*
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
    }*/
}