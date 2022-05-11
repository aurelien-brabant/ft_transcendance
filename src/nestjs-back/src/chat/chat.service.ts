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
	async userIsInChannel(channelId: number, userId: number) {
		const channel = await this.channelsService.findOne(channelId.toString());

		if (!channel) {
			throw new Error('No channel found.');
		}
		const isInChan = !!channel.users.find((user) => {
			return user.id === userId;
		});
		return isInChan;
	}

	async checkChannelPassword(channelId: number, password: string) {
		const channel = await this.channelsService.findOne(channelId.toString());

		if (channel && channel.privacy === 'protected') {
			const chanPassword = await this.channelsService.getChannelPassword(channelId.toString());
			const passIsValid = await comparePassword(password, chanPassword);

			if (passIsValid) return ;
			throw new Error('Invalid password');
		}
		throw new Error('Invalid operation');
	}

	/* Getters */
	async getChannelData(channelId: number) {
		return await this.channelsService.findOne(channelId.toString());
	}

	async getUserChannels(userId: number) {
		const channels = await this.channelsService.findAll();

		if (!channels) {
			throw new Error('No channel found.');
		}
		const userChannels = channels.filter((channel) =>
			!!channel.users.find((user) => { return user.id === userId; })
			|| (channel.privacy !== 'private')
		);
		return userChannels;
	}

	/* Create/delete/update */
	async createChannel(createChannelDto: CreateChannelDto) {
		const res = await this.channelsService.create(createChannelDto);

		return await this.channelsService.findOne(res.id.toString());
	}

	async updateChannel(channelId: number, updateChannelDto: UpdateChannelDto) {
		return await this.channelsService.update(channelId.toString(), updateChannelDto);
	}

	async deleteChannel(channelId: number) {
		return await this.channelsService.remove(channelId.toString());
	}

	async addMessageToChannel(createChannelMessageDto: CreateChannelMessageDto) {
		return await this.channelMessagesService.create(createChannelMessageDto);
	}

	async addUserToChannel(channelId: number, userId: number) {
		const user = await this.usersService.findOne(userId.toString());
		const channel = await this.channelsService.findOne(channelId.toString());

		await this.channelsService.update(channelId.toString(), {
			users: [ ...channel.users, user]
		});
		return user;
	}

	async removeUserFromChannel(channelId: number, userId: number) {
		const user = await this.usersService.findOne(userId.toString());
		const channel = await this.channelsService.findOne(channelId.toString());
		const filteredUsers = channel.users.filter((chanUser) => {
			return chanUser.id !== user.id;
		})

		await this.channelsService.update(channelId.toString(), {
			users: filteredUsers
		});
		return user;
	}

	/* Owner operations */
	async addAdminToChannel(channelId: number, ownerId: number, userId: number) {
		const channel = await this.channelsService.findOne(channelId.toString());

		if (channel) {
			if (channel.owner.id !== ownerId) {
				throw new Error('Insufficient Privileges');
			}

			const isAdmin = !!channel.admins.find((admin) => {
				return admin.id === userId;
			});

			if (!isAdmin) {
				const newAdmin = await this.usersService.findOne(userId.toString());

				await this.channelsService.update(channelId.toString(), {
					admins: [ ...channel.users, newAdmin]
				});
				return newAdmin;
			}
			throw new Error('User is already administrator');
		}
		throw new Error('Invalid operation');
	}

	async removeAdminFromChannel(channelId: number, ownerId: number, userId: number) {
		const channel = await this.channelsService.findOne(channelId.toString());

		if (channel) {
			if (channel.owner.id != ownerId) {
				throw new Error('Insufficient Privileges');
			}

			const isAdmin = !!channel.admins.find((admin) => {
				return admin.id === userId;
			});

			if (isAdmin) {
				const formerAdmin = await this.usersService.findOne(userId.toString());
				const filteredAdmins = channel.admins.filter((chanAdmin) => {
					return chanAdmin.id !== formerAdmin.id;
				});

				await this.channelsService.update(channelId.toString(), {
					admins: filteredAdmins
				});
				return formerAdmin;
			}
			throw new Error('User is not an administrator');
		}
		throw new Error('Invalid operation');
	}

	/* Admin operations */
	async kickUser(channelId: number, adminId: number, userId: number) {
		const channel = await this.channelsService.findOne(channelId.toString());

		if (channel) {
			const isAdmin = !!channel.admins.find((admin) => {
				return admin.id === userId;
			});
			if ((channel.owner.id != adminId) && !isAdmin) {
				throw new Error('Insufficient Privileges');
			}

			return await this.removeUserFromChannel(channelId, userId);
		}
		throw new Error('Invalid operation');
	}

	/**
	 * NOTE: Will be replaced by punishment
	 */
	async punishUser(channelId: number, adminId: number, userId: number) {
		const channel = await this.channelsService.findOne(channelId.toString());

		if (channel) {
			const isAdmin = !!channel.admins.find((admin) => {
				return admin.id === userId;
			});
			if ((channel.owner.id !== adminId) && !isAdmin) {
				throw new Error('Insufficient Privileges');
			}

		}
		throw new Error('Invalid operation');
		// const channel = await this.channelsService.findOne(channelId.toString());

		// if (channel) {
		// 	/* Only ban for testing */
		// 	const isBanned = !!channel.bannedUsers.find((bannedUser) => {
		// 		return bannedUser.id === userId;
		// 	});

		// 	if (!isBanned) {
		// 		const user = await this.usersService.findOne(userId);

		// 		await this.channelsService.update(channelId, {
		// 			bannedUsers: [ ...channel.bannedUsers, user]
		// 		});
		// 		return user;
		// 	}
		// 	throw new Error('User is already banned');
		// }
		// throw new Error('Invalid operation');
	}

	/**
	 * Direct Messages
	 */

	/* Getters */
	async getDmData(dmId: number) {
		return await this.directMessagesService.findOne(dmId.toString());
	}

	async getFriendFromDm(dmId: number, userId: number) {
		const dm = await this.directMessagesService.findOne(dmId.toString());

		return (dm.users[0].id === userId) ? dm.users[1] : dm.users[0];
	}

	async getUserDms(userId: number) {
		const dms = await this.directMessagesService.findAll();

		if (!dms) {
			throw new Error('No DM found.');
		}
		const userDms = dms.filter((dm) =>
			!!dm.users.find((user) => {
				return user.id === userId;
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
