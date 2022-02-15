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

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.messagesService.findOne(id);
    }

    @Get('/channel/:channelId')
    findAllByChannel(@Param('channelId') channelId: string) {
        return this.messagesService.findAllByChannel(channelId);
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
