import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Controller('channels')
export class ChannelsController {
    constructor(
        private readonly channelsService: ChannelsService
    ) {}

    @Get()
    findAll() {
        return this.channelsService.findAll();
    }

    @Get('/owner/:ownerId')
    findAllByOwner(@Param('ownerId') ownerId: string) {
        return this.channelsService.findAllByOwner(ownerId);
    }

    @Get('/public/:isPublic')
    findAllByPublic(@Param('isPublic') isPublic: boolean) {
        return this.channelsService.findAllByPublic(isPublic);
    }

    @Get('/protected/:isProtected')
    findAllByProtected(@Param('isProtected') isProtected: boolean) {
        return this.channelsService.findAllByProtected(isProtected);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.channelsService.findOne(id);
    }

    @Get('/:id/name')
    getName(@Param('id') id: string) {
        return this.channelsService.getName(id);
    }

    @Get('/:id/owner')
    getOwner(@Param('id') id: string) {
        return this.channelsService.getOwner(id);
    }

    @Get('/:id/users')
    getUsers(@Param('id') id: string) {
        return this.channelsService.getUsers(id);
    }

    @Get('/:id/messages')
    getMessages(@Param('id') id: string) {
        return this.channelsService.getMessages(id);
    }

    @Post()
    create(@Body() createChannelDto: CreateChannelDto) {
        console.log(createChannelDto instanceof CreateChannelDto);
        return this.channelsService.create(createChannelDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateChannelDto: UpdateChannelDto) {
        return this.channelsService.update(id, updateChannelDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.channelsService.remove(id);
    }
}
