import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChanMessage } from './entities/chan-messages.entity';
import { CreateChanMessageDto } from './dto/create-chan-message.dto';
import { UpdateChanMessageDto } from './dto/update-chan-message.dto';

@Injectable()
export class ChanMessagesService {
  private logger: Logger = new Logger('Channel Messages Service');

  constructor(
    @InjectRepository(ChanMessage)
    private readonly messagesRepository: Repository<ChanMessage>,
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
      throw new NotFoundException(`Message [${id}] not found`);
    }
    return message;
  }

  create(createChanMessageDto: CreateChanMessageDto) {
    const message = this.messagesRepository.create(createChanMessageDto);

    this.logger.log(`Create new message in channel [${createChanMessageDto.channel.id}]`);
    return this.messagesRepository.save(message);
  }

  async update(id: string, updateMessageDto: UpdateChanMessageDto) { 
    const message = await this.messagesRepository.preload({
      id: +id,
      ...updateMessageDto,
    });

    if (!message) {
      throw new NotFoundException(`Cannot update Message [${id}]: Not found`);
    }
    return this.messagesRepository.save(message);
  }

  async remove(id: string) { 
    const message = await this.findOne(id);

    if (!message) {
      throw new NotFoundException(`Message [${id}] not found`);
    }
    return this.messagesRepository.remove(message);
  }
}
