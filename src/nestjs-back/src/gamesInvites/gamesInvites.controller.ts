import { Controller, Get, Param, Post, Patch, Delete, Body } from '@nestjs/common';
import { GamesInvitesService } from './gamesInvites.service';
import { CreateGameInviteDto } from './dto/create-gameInvite.dto';
import { UpdateGameInviteDto } from './dto/update-gameInvite.dto';

@Controller('gamesInvites')
export class GamesInvitesController {
    constructor(private readonly gamesInvitesService: GamesInvitesService) {}
    @Get()
    findAll() {
        return this.gamesInvitesService.findAll();
    }
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.gamesInvitesService.findOne(id);
    }

    @Post()
    create(@Body() createGameInviteDto: CreateGameInviteDto) {
        console.log(createGameInviteDto instanceof CreateGameInviteDto);
        return this.gamesInvitesService.create(createGameInviteDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateGameInviteDto: UpdateGameInviteDto) {
        return this.gamesInvitesService.update(id, updateGameInviteDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.gamesInvitesService.remove(id);
    }
}