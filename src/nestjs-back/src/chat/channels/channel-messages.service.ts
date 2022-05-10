import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelMessage } from './entities/channel-messages.entity';
import { CreateChannelMessageDto } from './dto/create-channel-message.dto';
import { UpdateChannelMessageDto } from './dto/update-channel-message.dto';

@Injectable()
export class ChannelMessagesService {
  private logger: Logger = new Logger('Channel Messages Service');

  constructor(
    @InjectRepository(ChannelMessage)
    private readonly messagesRepository: Repository<ChannelMessage>,
  ) {}

  findAll() {
    return this.messagesRepository.find({
      relations: ['author', 'channel']
    });
  }

  async findOne(id: string) {
    const message =  await this.messagesRepository.findOne(id, {
      relations: ['author', 'channel']
    });

    if (!message) {
      throw new Error(`Message [${id}] not found`);
    }
    return message;
  }

  async create(createChanMessageDto: CreateChannelMessageDto) {
    const message = this.messagesRepository.create(createChanMessageDto);

    this.logger.log(`Create new message in channel [${createChanMessageDto.channel.id}]`);

    return await this.messagesRepository.save(message).catch(() => {
      throw new Error('Message may not be longer than 640 characters.');
    });
  }

  async update(id: string, updateMessageDto: UpdateChannelMessageDto) { 
    const message = await this.messagesRepository.preload({
      id: +id,
      ...updateMessageDto,
    });

    if (!message) {
      throw new Error(`Cannot update Message [${id}]: Not found`);
    }
    return this.messagesRepository.save(message);
  }

  async remove(id: string) { 
    const message = await this.findOne(id);

    if (!message) {
      throw new Error(`Message [${id}] not found`);
    }
    return this.messagesRepository.remove(message);
  }
}
