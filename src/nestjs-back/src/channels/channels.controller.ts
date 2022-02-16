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

    @Get('/:id/users')
    findUsers(@Param('id') id: string) {
        return this.channelsService.findUsers(id);
    }

    // @Get('/:id/peopleCount')
    // countPeople(@Param('id') id: string) {
    //     return this.channelsService.countPeople(id);
    // }

    @Get('/:id/messages')
    findMessages(@Param('id') id: string) {
        return this.channelsService.findMessages(id);
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
