import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { ChannelsService } from './channels/channels.service';
import { MessagesService } from './messages/messages.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly channelsService: ChannelsService,
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
  ) {}

  async saveMessage(content: string, authorId: string, channelId: string) {
    const channel = await this.channelsService.findOne(channelId);
    const author = await this.usersService.findOne(authorId);

    return this.messagesService.create({ content, author, channel });
  }

  async getUserChannels(id: string) {
    const publicChannels = await this.channelsService.getPublicChannels();
    const userChannels = await this.usersService.getJoinedChannels(id);
    const channels = publicChannels.concat(
      userChannels.filter(
        ({ id }) => !publicChannels.find(channel => channel.id === id)
      )
    );

    return channels;
  }

  async getChannelData(id: string) {
    return await this.channelsService.findOne(id);
  }
}
