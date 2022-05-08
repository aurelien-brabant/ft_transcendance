import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DmMessage } from './entities/dm-messages.entity';
import { CreateDmMessageDto } from './dto/create-dm-message.dto';
import { UpdateDmMessageDto } from './dto/update-dm-message.dto';

@Injectable()
export class DmMessagesService {
  private logger: Logger = new Logger('DM Messages Service');

  constructor(
    @InjectRepository(DmMessage)
    private readonly messagesRepository: Repository<DmMessage>,
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

  async create(createDmMessageDto: CreateDmMessageDto) {
    const message = this.messagesRepository.create(createDmMessageDto);

    this.logger.log(`Create new message in DM [${createDmMessageDto.dm.id}]`);

    return await this.messagesRepository.save(message).catch(() => {
      throw new Error('Message may not be longer than 640 characters.');
    });
  }

  async update(id: string, updateDmMessageDto: UpdateDmMessageDto) { 
    const message = await this.messagesRepository.preload({
      id: +id,
      ...updateDmMessageDto,
    });

    if (!message) {
      throw new Error(`Cannot update Message [${id}]: Not found`);
    }
    return this.messagesRepository.save(message);
  }

  async remove(id: string) { 
    const message = await this.findOne(id);

    if (!message) {
      throw new Error(`DmMessage [${id}] not found`);
    }
    return this.messagesRepository.remove(message);
  }
}
