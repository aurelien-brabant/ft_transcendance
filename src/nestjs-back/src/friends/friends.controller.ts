import { Controller, Get, Param, Post, Patch, Delete, Body } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';

@Controller('friends')
export class FriendsController {
    constructor(private readonly friendsService: FriendsService) {}
    @Get()
    findAll() {
        return this.friendsService.findAll();
    }
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.friendsService.findOne(id);
    }

    @Post()
    create(@Body() createFriendDto: CreateFriendDto) {
        console.log(createFriendDto instanceof CreateFriendDto);
        return this.friendsService.create(createFriendDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateFriendDto: UpdateFriendDto) {
        return this.friendsService.update(id, updateFriendDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.friendsService.remove(id);
    }
}