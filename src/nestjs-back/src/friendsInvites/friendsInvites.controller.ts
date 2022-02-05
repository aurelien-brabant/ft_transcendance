import { Controller, Get, Param, Post, Patch, Delete, Body } from '@nestjs/common';
import { FriendsInvitesService } from './friendsInvites.service';
import { CreateFriendInviteDto } from './dto/create-friendInvite.dto';
import { UpdateFriendInviteDto } from './dto/update-friendInvite.dto';

@Controller('friendsInvites')
export class FriendsInvitesController {
    constructor(private readonly friendsInvitesService: FriendsInvitesService) {}
    @Get()
    findAll() {
        return this.friendsInvitesService.findAll();
    }
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.friendsInvitesService.findOne(id);
    }

    @Post()
    create(@Body() createFriendInviteDto: CreateFriendInviteDto) {
        console.log(createFriendInviteDto instanceof CreateFriendInviteDto);
        return this.friendsInvitesService.create(createFriendInviteDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateFriendInviteDto: UpdateFriendInviteDto) {
        return this.friendsInvitesService.update(id, updateFriendInviteDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.friendsInvitesService.remove(id);
    }
}