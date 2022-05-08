import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DirectMessage } from './entities/direct-messages';
import { CreateDirectMessageDto } from './dto/create-direct-message.dto';
import { UpdateDirectMessageDto } from './dto/update-direct-message.dto';
import { DmMessagesService } from 'src/chat/direct-messages/messages/dm-messages.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class DirectMessagesService {
  private logger: Logger = new Logger('DirectMessages Service');

  constructor(
    @InjectRepository(DirectMessage)
    private readonly directMessagesRepository: Repository<DirectMessage>,
    private readonly messagesService: DmMessagesService,
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
      throw new NotFoundException(`Direct Message [${id}] not found`);
    }
    return dm;
  }

  async create(createDirectMessageDto: CreateDirectMessageDto) {
    let existingDm: DirectMessage;

    try {
      existingDm = await this.usersService.getDirectMessage(
        createDirectMessageDto.users[0].id.toString(),
        createDirectMessageDto.users[1].id.toString()
      );
      return existingDm;
    } catch (e) {
      if (e instanceof NotFoundException) {
        const dm = this.directMessagesRepository.create(createDirectMessageDto);

        this.logger.log('Create new Direct Message');
        return this.directMessagesRepository.save(dm);
      }
    }
  }

  async update(id: string, updateDirectMessageDto: UpdateDirectMessageDto) {
    const dm = await this.directMessagesRepository.preload({
      id: +id,
      ...updateDirectMessageDto
    });
    if (!dm) {
      throw new NotFoundException(`Cannot update Direct Message [${id}]: Not found`);
    }
    this.logger.log(`Update Direct Message [${dm.id}]`);
    return this.directMessagesRepository.save(dm);
  }

  async remove(id: string) { 
    const dm = await this.directMessagesRepository.findOne(id);

    if (!dm) {
      throw new NotFoundException(`Direct Message [${id}] not found`);
    }
    this.logger.log(`Remove Direct Message [${dm.id}]`);
    return this.directMessagesRepository.remove(dm);
  }

  /**
   * Save a DM message in database
   * 
   * @param content - The content of the message to save
   * @param dmId - The id of the Direct Message the message applies to
   * @param userId - The id of the author (the user that sends the message)
   * @returns The DM message as saved in database
   */
  async addMessage(content: string, dmId: string, authorId: string) {
    const dm = await this.directMessagesRepository.findOne(dmId);
    const author = await this.usersService.findOne(authorId);

    return await this.messagesService.create({ content, dm, author });
  }
}
