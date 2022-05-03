import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { ChannelsService } from './channels/channels.service';
import { DirectMessagesService } from './direct-messages/direct-messages.service';
import { MessagesService } from './messages/messages.service';
import { CreateChannelDto } from './channels/dto/create-channel.dto';
import { CreateDirectMessageDto } from './direct-messages/dto/create-direct-message.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly channelsService: ChannelsService,
    private readonly directMessagesService: DirectMessagesService,
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
  ) {}

  /* Channels */
  async getChannelData(id: string) {
    return await this.channelsService.findOne(id);
  }

  async getUserChannels(userId: string) {
    const channels = await this.channelsService.findAll();

    if (!channels) {
      throw new NotFoundException('No channel found.');
    }
    const userChannels = channels.filter(
      (channel) => channel.users.find(
        (user) => user.id.toString() === userId
      )
    );
    return userChannels;
  }

  async createChannel(createChannelDto: CreateChannelDto) {
    return await this.channelsService.create(createChannelDto);
  }

  async addUserToChannel(userId: string, channelId: string) {
    const user = await this.usersService.findOne(userId);
    const channel = await this.channelsService.findOne(channelId);

    await this.channelsService.update(channelId, {
      users: [ ...channel.users, user]
    });
    return user;
  }

  async addMessageToChannel(content: string, authorId: string, channelId: string) {
    const channel = await this.channelsService.findOne(channelId);
    const author = await this.usersService.findOne(authorId);

    return await this.messagesService.create({ content, author, channel });
  }

  /* Direct Messages */
  async getDmData(id: string) {
    return await this.directMessagesService.findOne(id);
  }

  async getFriendFromDm(id: string, userId: string) {
    const dm = await this.directMessagesService.findOne(id);

    const friend = dm.users[0].id.toString() === userId ? dm.users[1] : dm.users[0];
    return friend;
  }

  async getUserDms(userId: string) {
    const dms = await this.directMessagesService.findAll();

    if (!dms) {
      throw new NotFoundException('No DM found.');
    }
    const userDms = dms.filter(
      (dm) => dm.users.find(
        (user) => user.id.toString() === userId
      )
    );
    return userDms;
  }

  async createDm(createDirectMessageDto: CreateDirectMessageDto) {
    return await this.directMessagesService.create(createDirectMessageDto);
  }

  async addMessageToDm(content: string, authorId: string, dmId: string) {
    const channel = await this.directMessagesService.findOne(dmId);
    const author = await this.usersService.findOne(authorId);

    return await this.messagesService.create({ content, author, channel });
  }
}
