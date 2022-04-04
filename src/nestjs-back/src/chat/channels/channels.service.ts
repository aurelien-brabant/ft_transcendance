import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CronJob } from 'cron';
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
    private schedulerRegistry: SchedulerRegistry
  ) {}

  /* A user is unban after a limited time */
  scheduleUnban(channelId: string, bannedId: string, duration: number) {
    const unbanTime = new Date(Date.now() + duration * 60000);

    const job = new CronJob(unbanTime, async () => {
      const channel = await this.channelsRepository.findOne(channelId, {
        relations: ['bannedUsers']
      });
      channel.bannedUsers = channel.bannedUsers.filter(
        (user) => user.id.toString() !== bannedId
      );
      this.channelsRepository.save(channel);
    });

    this.schedulerRegistry.addCronJob(`unban_user${bannedId}_${unbanTime}_chan${channelId}`, job);
    job.start();
  }

  /* A user is unmute after a limited time */
  scheduleUnmute(channelId: string, mutedId: string, duration: number) {
    const unmuteTime = new Date(Date.now() + duration * 60000);

    const job = new CronJob(unmuteTime, async () => {
      const channel =  await this.channelsRepository.findOne(channelId, {
        relations: ['mutedUsers']
      });
      channel.mutedUsers = channel.mutedUsers.filter(
        (user) => user.id.toString() !== mutedId
      );
      this.channelsRepository.save(channel);
    });

    this.schedulerRegistry.addCronJob(`unmute_user${mutedId}_${unmuteTime}_chan${channelId}`, job);
    job.start();
  }

  findAll() {
    return this.channelsRepository.find({
      relations: ['owner']
    });
  }

  async findOne(id: string) {
    const channel =  await this.channelsRepository.findOne(id, {
      relations: [
        'owner',
        'users',
        'admins',
        'mutedUsers', 'bannedUsers',
        'messages', 'messages.author'
      ]
    });
    if (!channel) {
      throw new NotFoundException(`Channel [${id}] not found`);
    }
    return channel;
  }

  async create(createChannelDto: CreateChannelDto) {
    const ownedChannels = await this.usersService.getOwnedChannels(createChannelDto.owner.id.toString());

    if (ownedChannels.length !== 0) {
      const chanExists = !!ownedChannels.find(channel => {
        return channel.name === createChannelDto.name;
      })
      if (chanExists) {
        throw new UnauthorizedException(`Channel with name '${createChannelDto.name}' already exist`);
      }
    }
    const hashedPwd = (createChannelDto.password) ? await hashPassword(createChannelDto.password, 10) : "";
    const channel = this.channelsRepository.create({
      ...createChannelDto,
      password: hashedPwd
    });
    return this.channelsRepository.save(channel);
  }

  async update(id: string, updateChannelDto: UpdateChannelDto) {
    let channel = await this.channelsRepository.preload({
      id: +id,
      ...updateChannelDto
    });
    if (!channel) {
      throw new NotFoundException(`Cannot update Channel [${id}]: Not found`);
    }
    if (updateChannelDto.password) {
      const hashedPwd = await hashPassword(updateChannelDto.password, 10);
      channel.password = hashedPwd;
    }
    if (updateChannelDto.bannedUsers) {
      const bannedId = updateChannelDto.bannedUsers[updateChannelDto.bannedUsers.length -1].id.toString();
      this.scheduleUnban(id, bannedId, channel.restrictionDuration);
    }
    if (updateChannelDto.mutedUsers) {
      const mutedId = updateChannelDto.mutedUsers[updateChannelDto.mutedUsers.length -1].id.toString();
      this.scheduleUnmute(id, mutedId, channel.restrictionDuration);
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

  /* Getters */
  async getChannelPassword(id: string) {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .select('channel.password')
      .where('channel.id = :id', { id })
      .getOne();
    return channel.password;
  }

  async getChannelUsers(id: string) {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoinAndSelect('channel.users', 'users')
      .where('channel.id = :id', { id })
      .getOne();
    return channel;
  }

  /* Join */
  async joinProtectedChan(id: string, userId: string, password: string) {
    let channel = await this.channelsRepository.findOne(id, {
      where: { privacy: 'protected' }
    });
    const user = await this.usersService.findOne(userId);

    if (channel) {
      const chanPassword = await this.getChannelPassword(id);
      const passIsValid = await comparePassword(password, chanPassword);
      if (passIsValid) {
        channel = await this.getChannelUsers(id);
        channel.users.push(user);
        return this.channelsRepository.save(channel);
      }
    }
    throw new UnauthorizedException();
  }
}
