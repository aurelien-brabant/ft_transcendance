import { Controller, Get, Param, Post, Patch, Delete, Body, Query } from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
// import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) {}

    @Get()
    findAll() {
        return this.gamesService.findAll();
    }
/*
    @Get()
    findAll(@Query() paginationQuery: PaginationQueryDto) {
        return this.gamesService.findAll(paginationQuery);
    }
  */  
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.gamesService.findOne(id);
    }

    @Post()
    create(@Body() createGameDto: CreateGameDto) {
        console.log(createGameDto instanceof CreateGameDto);
        return this.gamesService.create(createGameDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
        return this.gamesService.update(id, updateGameDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.gamesService.remove(id);
    }
}