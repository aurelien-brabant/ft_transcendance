import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Messages } from './entities/messages.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Messages)
        private readonly messagesRepository: Repository<Messages>,
    ) {}

    findAll() {
        return this.messagesRepository.find();
    }

    async findAllByChannel(channelId: string) {
        const messages = this.messagesRepository.createQueryBuilder("message")
            .where("message.channel.id = :id", {id: channelId})
            .execute();
        return messages;
    }

    async findOne(id: string) {
        const message =  await this.messagesRepository.findOne(id);
        if (!message)
            throw new NotFoundException(`Message [${id}] not found`);
        return message;
    }

    create(createMessageDto: CreateMessageDto) {
        const message = this.messagesRepository.create(createMessageDto);
        return this.messagesRepository.save(message);
    }

    async update(id: string, updateMessageDto: UpdateMessageDto) { 
        const message = await this.messagesRepository.preload({
            id: +id,
            ...updateMessageDto,
        });
        if (!message)
            throw new NotFoundException(`Cannot update Message [${id}]: Not found`);
        return this.messagesRepository.save(message);
    }

    async remove(id: string) { 
        const message = await this.findOne(id);
        if (!message)
            throw new NotFoundException(`Message [${id}] not found`);
        return this.messagesRepository.remove(message);
    }
}
