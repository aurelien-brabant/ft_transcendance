import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGameInviteDto } from './dto/create-gameInvite.dto';
import { UpdateGameInviteDto } from './dto/update-gameInvite.dto';
import { GamesInvite } from './entities/gamesInvites.entity';

@Injectable()
export class GamesInvitesService {

    constructor(
        @InjectRepository(GamesInvite)
        private readonly gamesInvitesRepository: Repository<GamesInvite>,
    ) {}

    findAll() {
        return this.gamesInvitesRepository.find();
    }

    async findOne(id: string) { 
            const invite =  await this.gamesInvitesRepository.findOne(id);
        if (!invite)
            throw new NotFoundException(`Game invite [${id}] not found`);
        return invite;
    }

    create(createGameInviteDto: CreateGameInviteDto) {
        const invite = this.gamesInvitesRepository.create(createGameInviteDto);
        return this.gamesInvitesRepository.save(invite);
    }
 
    async update(id: string, updateGameInviteDto: UpdateGameInviteDto) { 
        const invite = await this.gamesInvitesRepository.preload({
            id: +id,
            ...updateGameInviteDto,
        });
        if (!invite)
            throw new NotFoundException(`Cannot update game invite[${id}]: Not found`);
        return this.gamesInvitesRepository.save(invite);
    }
   
    async remove(id: string) { 
        const invite = await this.findOne(id);
        return this.gamesInvitesRepository.remove(invite);
    }
}