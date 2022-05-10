import { Injectable } from '@nestjs/common';
import { compare as comparePassword } from 'bcryptjs';
import { UsersService } from 'src/users/users.service';
import { ChannelsService } from './channels/channels.service';
import { ChannelMessagesService } from './channels/channel-messages.service';
import { DirectMessagesService } from './direct-messages/direct-messages.service';
import { DmMessagesService } from './direct-messages/dm-messages.service';
import { CreateChannelDto } from './channels/dto/create-channel.dto';
import { UpdateChannelDto } from './channels/dto/update-channel.dto';
import { CreateChannelMessageDto } from './channels/dto/create-channel-message.dto';
import { CreateDirectMessageDto } from './direct-messages/dto/create-direct-message.dto';
import { CreateDmMessageDto } from './direct-messages/dto/create-dm-message.dto';

@Injectable()
export class ChatService {
	constructor(
		private readonly channelsService: ChannelsService,
		private readonly channelMessagesService: ChannelMessagesService,
		private readonly directMessagesService: DirectMessagesService,
		private readonly dmMessagesService: DmMessagesService,
		private readonly usersService: UsersService,
	) {}

	/**
	 * Channels
	 */

	/* Helpers */
	async userIsInChannel(userId: string, channelId: string) {
		const channel = await this.channelsService.findOne(channelId);

		if (!channel) {
			throw new Error('No channel found.');
		}
		const isInChan = !!channel.users.find((user) => {
			return user.id === parseInt(userId);
		});
		return isInChan;
	}

	async checkChannelPassword(channelId: string, password: string) {
		const channel = await this.channelsService.findOne(channelId);

		if (channel && channel.privacy === 'protected') {
			const chanPassword = await this.channelsService.getChannelPassword(channelId);
			const passIsValid = await comparePassword(password, chanPassword);

			if (passIsValid) return ;
			throw new Error('Invalid password');
		}
		throw new Error('Invalid operation');
	}

	async checkPrivileges(userId: string, channelId: string, ownerOnly = false) {
		const channel = await this.channelsService.findOne(channelId);

		if (channel) {
			const hasOwnerPriv = channel.owner.id === parseInt(userId);
			const hasAdminPriv = !!channel.admins.find((admin) => {
				return admin.id === parseInt(userId);
			});

			if (ownerOnly && hasOwnerPriv) return;
			if (hasOwnerPriv || hasAdminPriv) return ;
			throw new Error('Insufficient Privileges');
		}
		throw new Error('Invalid operation');
	}

	/* Getters */
	async getChannelData(id: string) {
		return await this.channelsService.findOne(id);
	}

	async getUserChannels(userId: string) {
		const channels = await this.channelsService.findAll();

		if (!channels) {
			throw new Error('No channel found.');
		}
		const userChannels = channels.filter((channel) =>
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

	async updateChannel(channelId: string, updateChannelDto: UpdateChannelDto) {
		return await this.channelsService.update(channelId, updateChannelDto);
	}

	async deleteChannel(channelId: string) {
		return await this.channelsService.remove(channelId);
	}

	async addMessageToChannel(createChannelMessageDto: CreateChannelMessageDto) {
		return await this.channelMessagesService.create(createChannelMessageDto);
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
		const filteredUsers = channel.users.filter((chanUser) => {
			return chanUser.id !== user.id;
		})

		await this.channelsService.update(channelId, {
			users: filteredUsers
		});
		return user;
	}

	/* Owner operations */
	async addAdminToChannel(ownerId: string, channelId: string, userId: string) {
		const channel = await this.channelsService.findOne(channelId);

		if (channel && (channel.owner.id === parseInt(ownerId))) {
			const newAdmin = await this.usersService.findOne(userId);
			const isAdmin = !!channel.admins.find((admin) => {
				return admin.id === parseInt(userId);
			});

			if (!isAdmin) {
				await this.channelsService.update(channelId, {
					admins: [ ...channel.users, newAdmin]
				});
				return newAdmin;
			}
			throw new Error('User is already administrator');
		}
		throw new Error('Invalid operation');
	}

	async removeAdminFromChannel(ownerId: string, channelId: string, userId: string) {
		const channel = await this.channelsService.findOne(channelId);

		if (channel && (channel.owner.id === parseInt(ownerId))) {
			const formerAdmin = await this.usersService.findOne(userId);
			const isAdmin = !!channel.admins.find((admin) => {
				return admin.id === parseInt(userId);
			});

			if (isAdmin) {
				const filteredAdmins = channel.admins.filter((chanAdmin) => {
					return chanAdmin.id !== formerAdmin.id;
				});
	
				await this.channelsService.update(channelId, {
					admins: filteredAdmins
				});
				console.log(channel);
				return formerAdmin;
			}
			throw new Error('User is not an administrator');
		}
		throw new Error('Invalid operation');
	}

	/**
	 * NOTE: Will be replaced by punishment
	 */
	async punishUser(adminId: string, channelId: string, userId: string) {
		const channel = await this.channelsService.findOne(channelId);

		if (channel) {
			/* Only ban for testing */
			const isBanned = !!channel.bannedUsers.find((bannedUser) => {
				return bannedUser.id === parseInt(userId);
			});

			if (!isBanned) {
				const user = await this.usersService.findOne(userId);

				await this.channelsService.update(channelId, {
					bannedUsers: [ ...channel.bannedUsers, user]
				});
				return user;
			}
			throw new Error('User is already banned');
		}
		throw new Error('Invalid operation');
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

		return (dm.users[0].id === parseInt(userId)) ? dm.users[1] : dm.users[0];
	}

	async getUserDms(userId: string) {
		const dms = await this.directMessagesService.findAll();

		if (!dms) {
			throw new Error('No DM found.');
		}
		const userDms = dms.filter((dm) =>
			!!dm.users.find((user) => {
				return user.id === parseInt(userId);
			})
		);
		return userDms;
	}

	/* Create/delete/update */
	async createDm(createDirectMessageDto: CreateDirectMessageDto) {
		const res = await this.directMessagesService.create(createDirectMessageDto);

		return await this.directMessagesService.findOne(res.id.toString());
	}

	async addMessageToDm(createDmMessageDto: CreateDmMessageDto) {
		return await this.dmMessagesService.create(createDmMessageDto);
	}
}
