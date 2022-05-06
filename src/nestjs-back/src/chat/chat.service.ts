import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { compare as comparePassword } from 'bcryptjs';
import { UsersService } from 'src/users/users.service';
import { ChannelsService } from './channels/channels.service';
import { DirectMessagesService } from './direct-messages/direct-messages.service';
import { CreateChannelDto } from './channels/dto/create-channel.dto';
import { CreateDirectMessageDto } from './direct-messages/dto/create-direct-message.dto';

@Injectable()
export class ChatService {
	constructor(
		private readonly channelsService: ChannelsService,
		private readonly directMessagesService: DirectMessagesService,
		private readonly usersService: UsersService,
	) {}

	/**
	 * Channels
	 */

	/* Helpers */
	async userIsInChannel(userId: string, channelId: string) {
		const channel = await this.channelsService.findOne(channelId);

		if (!channel) {
			throw new NotFoundException('No channel found.');
		}
		const isInChan = !!channel.users.find(
			(user) => { return user.id === parseInt(userId); }
		);
		return isInChan;
	}

	async checkChannelPassword(channelId: string, password: string) {
		const channel = await this.channelsService.findOne(channelId);

		if (channel && channel.privacy === 'protected') {
			const chanPassword = await this.channelsService.getChannelPassword(channelId);
			const passIsValid = await comparePassword(password, chanPassword);

			if (passIsValid) return ;
			throw new UnauthorizedException('Invalid password');
		}
		throw new UnauthorizedException('Invalid operation');
	}

	/* Getters */
	async getChannelData(id: string) {
		return await this.channelsService.findOne(id);
	}

	async getUserChannels(userId: string) {
		const channels = await this.channelsService.findAll();

		if (!channels) {
			throw new NotFoundException('No channel found.');
		}
		const userChannels = channels.filter(
			(channel) =>
				!!channel.users.find((user) => { return user.id === parseInt(userId); })
				|| (channel.privacy !== 'private')
		);
		return userChannels;
	}

	/* Create/delete/update */
	async createChannel(createChannelDto: CreateChannelDto) {
		const res = await this.channelsService.create(createChannelDto);

		return await this.channelsService.findOne(res.id.toString());
	}

	async addMessageToChannel(content: string, channelId: string, authorId: string) {
		return await this.channelsService.addMessage(content, channelId, authorId);
	}

	async addUserToChannel(userId: string, channelId: string) {
		const user = await this.usersService.findOne(userId);
		const channel = await this.channelsService.findOne(channelId);

		await this.channelsService.update(channelId, {
			users: [ ...channel.users, user]
		});
		return user;
	}

	async removeUserFromChannel(userId: string, channelId: string) {
		const user = await this.usersService.findOne(userId);
		const channel = await this.channelsService.findOne(channelId);
		const filteredUsers = channel.users.filter((user) => {
			return user.id !== parseInt(userId)
		})

		await this.channelsService.update(channelId, {
			users: filteredUsers
		});
		return user;
	}

	/**
	 * Direct Messages
	 */

	/* Getters */
	async getDmData(id: string) {
		return await this.directMessagesService.findOne(id);
	}

	async getFriendFromDm(dmId: string, userId: string) {
		const dm = await this.directMessagesService.findOne(dmId);

		return (dm.users[0].id.toString() === userId) ? dm.users[1] : dm.users[0];
	}

	async getUserDms(userId: string) {
		const dms = await this.directMessagesService.findAll();

		if (!dms) {
			throw new NotFoundException('No DM found.');
		}
		const userDms = dms.filter(
			(dm) => dm.users.filter(
				(user) => user.id.toString() === userId
			)
		);
		return userDms;
	}

	/* Create/delete/update */
	async createDm(createDirectMessageDto: CreateDirectMessageDto) {
		const res = await this.directMessagesService.create(createDirectMessageDto);

		return await this.directMessagesService.findOne(res.id.toString());
	}

	async addMessageToDm(content: string, dmId: string, authorId: string) {
		return await this.directMessagesService.addMessage(content, dmId, authorId);
	}
}
