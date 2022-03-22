import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  hash as hashPassword,
  compare as comparePassword
} from 'bcrypt';
import { Channel } from './entities/channels.entity';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>,
    private readonly usersService: UsersService,
  ) {}

  findAll() {
    return this.channelsRepository.find({
      relations: ['owner']
    });
  }

  async findOne(id: string) {
    const channel =  await this.channelsRepository.findOne(id, {
      relations: ['owner', 'users', 'messages', 'messages.author'] // tmp
    });
    if (!channel) {
      throw new NotFoundException(`Channel [${id}] not found`);
    }
    return channel;
  }

  async create(createChannelDto: CreateChannelDto) {
    const channel = this.channelsRepository.create(createChannelDto);
    return this.channelsRepository.save(channel);
  }

  async update(id: string, updateChannelDto: UpdateChannelDto) {
    let channel = await this.channelsRepository.preload({
      id: +id,
      ...updateChannelDto
    });
    if (channel && updateChannelDto.password) {
      const hashedPwd = await hashPassword(updateChannelDto.password, 10);
      channel = await this.channelsRepository.preload({
        id: +id,
        password: hashedPwd
      });
    }
    if (!channel) {
      throw new NotFoundException(`Cannot update Channel [${id}]: Not found`);
    }
    return this.channelsRepository.save(channel);
  }

  async remove(id: string) { 
    const channel = await this.channelsRepository.findOne(id);
    if (!channel) {
      throw new NotFoundException(`Channel [${id}] not found`);
    }
    return this.channelsRepository.remove(channel);
  }

  async getChannelPassword(id: string) {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .select('channel.password')
      .where('channel.id = :id', { id })
      .getOne();
    return channel.password;
  }

  async getChannelUsers(id: string, privacy: string) {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoinAndSelect('channel.users', 'users')
      .where('channel.id = :id', { id })
      .andWhere('channel.privacy = :privacy', { privacy })
      .getOne();
    return channel;
  }

  async joinProtectedChan(id: string, userId: string, password: string) {
    const channel = await this.getChannelUsers(id, 'protected');
    const user = await this.usersService.findOne(userId);

    if (channel && user) {
      const chanPassword = await this.getChannelPassword(id);
      const passIsValid = await comparePassword(password, chanPassword);
      if (passIsValid) {
        channel.users.push(user);
        return this.channelsRepository.save(channel);
      }
    }
    throw new UnauthorizedException();
  }
}
