import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CronJob } from 'cron';
import { hash as hashPassword } from 'bcryptjs';
import { Channel } from './entities/channels.entity';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ChanMessagesService } from './messages/chan-messages.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChannelsService {
  private logger: Logger = new Logger('Channels Service');

  constructor(
    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>,
    private readonly messagesService: ChanMessagesService,
    private readonly usersService: UsersService,
    private schedulerRegistry: SchedulerRegistry
  ) {}

  /**
   * NOTE: to be updated
   * A user is unban after a limited time
   */
  scheduleUnban(channelId: string, userId: string, duration: number) {
    const unbanTime = new Date(Date.now() + duration * 60000);

    const job = new CronJob(unbanTime, async () => {
      const channel = await this.channelsRepository.findOne(channelId, {
        relations: ['bannedUsers']
      });
      channel.bannedUsers = channel.bannedUsers.filter(
        (user) => user.id.toString() !== userId
      );
      this.channelsRepository.save(channel);
      this.logger.log(`Unban user [${userId}] on channel [${channel.id}][${channel.name}]`);
    });

    this.schedulerRegistry.addCronJob(`unban_user${userId}_${unbanTime}_chan${channelId}`, job);
    job.start();
  }

  /**
   * NOTE: to be updated
   * A user is unmute after a limited time
   */
  scheduleUnmute(channelId: string, userId: string, duration: number) {
    const unmuteTime = new Date(Date.now() + duration * 60000);

    const job = new CronJob(unmuteTime, async () => {
      const channel =  await this.channelsRepository.findOne(channelId, {
        relations: ['mutedUsers']
      });
      channel.mutedUsers = channel.mutedUsers.filter(
        (user) => user.id.toString() !== userId
      );
      this.channelsRepository.save(channel);
      this.logger.log(`Unmute user [${userId}] on channel [${channel.id}][${channel.name}]`);
    });

    this.schedulerRegistry.addCronJob(`unmute_user${userId}_${unmuteTime}_chan${channelId}`, job);
    job.start();
  }

  findAll() {
    return this.channelsRepository.find({
      relations: [
        'owner',
        'users',
        'messages',
        'messages.author'
      ]
    });
  }

  async findOne(id: string) {
    const channel =  await this.channelsRepository.findOne(id, {
      relations: [
        'owner',
        'users',
        'admins',
        'mutedUsers',
        'bannedUsers',
        'messages',
        'messages.author'
      ]
    });
    if (!channel) {
      throw new NotFoundException(`Channel [${id}] not found`);
    }

    return channel;
  }

  async create(createChannelDto: CreateChannelDto) {
    if (createChannelDto.password) {
      createChannelDto.password = await hashPassword(createChannelDto.password, 10);
    }
    const channel = this.channelsRepository.create(createChannelDto);

    this.logger.log(`Create new channel [${channel.name}]`);

    return await this.channelsRepository.save(channel).catch(() => {
        throw new UnauthorizedException(`Group '${createChannelDto.name}' already exists. Choose another name.`);
    });
  }

  async update(id: string, updateChannelDto: UpdateChannelDto) {
    if (updateChannelDto.password) {
      updateChannelDto.password = await hashPassword(updateChannelDto.password, 10);
    }

    const channel = await this.channelsRepository.preload({
      id: +id,
      ...updateChannelDto
    });

    if (!channel) {
      throw new NotFoundException(`Cannot update Channel [${id}]: Not found`);
    }
    if (updateChannelDto.bannedUsers) {
      const userId = updateChannelDto.bannedUsers[updateChannelDto.bannedUsers.length -1].id.toString();
      this.scheduleUnban(id, userId, channel.restrictionDuration);
    }
    if (updateChannelDto.mutedUsers) {
      const userId = updateChannelDto.mutedUsers[updateChannelDto.mutedUsers.length -1].id.toString();
      this.scheduleUnmute(id, userId, channel.restrictionDuration);
    }
    this.logger.log(`Update channel [${channel.id}][${channel.name}]`);

    return this.channelsRepository.save(channel);
  }

  async remove(id: string) { 
    const channel = await this.channelsRepository.findOne(id);

    if (!channel) {
      throw new NotFoundException(`Channel [${id}] not found`);
    }
    this.logger.log(`Remove channel [${channel.id}][${channel.name}]`);

    return this.channelsRepository.remove(channel);
  }

  async addMessage(content: string, channelId: string, authorId: string) {
    const channel = await this.channelsRepository.findOne(channelId);
    const author = await this.usersService.findOne(authorId);

    return await this.messagesService.create({ content, channel, author });
  }

  /**
   * Used whenever a user wants to join a password-protected channel
   */
  async getChannelPassword(id: string) {
    const channel = await this.channelsRepository.createQueryBuilder('channel')
      .select('channel.password')
      .where('channel.id = :id', { id })
      .getOne();

    return channel.password;
  }
}
