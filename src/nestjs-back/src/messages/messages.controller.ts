import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller('messages')
export class MessagesController {
    constructor(
        private readonly messagesService: MessagesService
    ) {}

    @Get()
    findAll() {
        return this.messagesService.findAll();
    }

    @Get('/channel/:channelId')
    findAllByChannel(@Param('channelId') channelId: string) {
        return this.messagesService.findAllByChannel(channelId);
    }

    @Get('/sender/:senderId')
    findAllBySender(@Param('senderId') senderId: string) {
        return this.messagesService.findAllBySender(senderId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.messagesService.findOne(id);
    }

    @Get(':id/sender')
    getSender(@Param('id') id: string) {
        return this.messagesService.getSender(id);
    }

    @Get(':id/channel')
    getChannel(@Param('id') id: string) {
        return this.messagesService.getChannel(id);
    }

    @Post()
    create(@Body() createMessageDto: CreateMessageDto) {
        console.log(createMessageDto instanceof CreateMessageDto);
        return this.messagesService.create(createMessageDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
        return this.messagesService.update(id, updateMessageDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.messagesService.remove(id);
    }
}
