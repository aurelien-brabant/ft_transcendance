import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DirectMessage } from './entities/direct-messages';
import { CreateDirectMessageDto } from './dto/create-direct-message.dto';
import { UpdateDirectMessageDto } from './dto/update-direct-message.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class DirectMessagesService {
  private logger: Logger = new Logger('DirectMessages Service');

  constructor(
    @InjectRepository(DirectMessage)
    private readonly directMessagesRepository: Repository<DirectMessage>,
    private readonly usersService: UsersService,
  ) {}

  findAll() {
    return this.directMessagesRepository.find({
      relations: [
        'users',
        'messages',
        'messages.author'
      ]
    });
  }

  async findOne(id: string) {
    const dm =  await this.directMessagesRepository.findOne(id, {
      relations: [
        'users',
        'messages',
        'messages.author'
      ]
    });
    if (!dm) {
      throw new Error(`Direct Message [${id}] not found`);
    }
    return dm;
  }

  async create(createDirectMessageDto: CreateDirectMessageDto) {
    const dm = this.directMessagesRepository.create(createDirectMessageDto);

    this.logger.log('Create new Direct Message');
    return this.directMessagesRepository.save(dm);
  }

  async update(id: string, updateDirectMessageDto: UpdateDirectMessageDto) {
    const dm = await this.directMessagesRepository.preload({
      id: +id,
      ...updateDirectMessageDto
    });
    if (!dm) {
      throw new Error(`Cannot update Direct Message [${id}]: Not found`);
    }
    this.logger.log(`Update Direct Message [${dm.id}]`);
    return this.directMessagesRepository.save(dm);
  }

  async remove(id: string) { 
    const dm = await this.directMessagesRepository.findOne(id);

    if (!dm) {
      throw new Error(`Direct Message [${id}] not found`);
    }
    this.logger.log(`Remove Direct Message [${dm.id}]`);
    return this.directMessagesRepository.remove(dm);
  }
}
