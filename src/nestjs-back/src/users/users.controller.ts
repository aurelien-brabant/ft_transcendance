import { Controller, Get, Param, Post, Patch, Delete, Body, ConflictException, NotFoundException, Response, Query } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { createReadStream, statSync } from 'fs';
import path, { join } from 'path/posix';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    findAll(@Query() paginationQuery: PaginationQueryDto) {
        return this.usersService.findAll(paginationQuery);
    }
    
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }
    
    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        const createdUser = await this.usersService.create(createUserDto);

        if (!createdUser) {
            throw new ConflictException();
        }

        // exclude password from returned JSON
        const { password, ...userData } = createdUser;

        return userData;
    }

    @Get('/:id/photo')
    async findPhoto(@Param('id') id: string, @Response() res: any) {
        const user = await this.usersService.findOne(id);

        if (!user) {
            throw new NotFoundException();
        }

        const avatarPath = join('/upload', 'avatars', user.username);

        try {
            statSync(avatarPath);
        } catch (e) {
            throw new NotFoundException;
        } const file = createReadStream(avatarPath);

        file.pipe(res);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
