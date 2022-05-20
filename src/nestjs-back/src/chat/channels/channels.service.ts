import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash as hashPassword } from 'bcryptjs';
import { Channel } from './entities/channels.entity';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { PunishmentsService } from "./punishments.service";

@Injectable()
export class ChannelsService {
	private logger: Logger = new Logger('Channels Service');

	constructor(
		@InjectRepository(Channel)
		private readonly channelsRepository: Repository<Channel>,
		private readonly channelPunishmentService: PunishmentsService
	) {}

	/**
	 * Channel punishments
	 */
	async findOutIfUserIsMuted(channelId: number, userId: number) {
		return await this.channelPunishmentService.isUserCurrentlyMuted(channelId, userId);
	}

	async findOutIfUserIsBanned(channelId: number, userId: number) {
		return await this.channelPunishmentService.isUserCurrentlyBanned(channelId, userId);
	}

	async banUser(channelId: number, punishedId: number, punisherId: number) {
		const isBanned = await this.channelPunishmentService.isUserCurrentlyBanned(channelId, punishedId);

		if (!isBanned) {
			return this.channelPunishmentService.punishUser(
				channelId, punishedId, punisherId, 'ban', {
				reason: 'Un méchant garçon, à n\'en point douter.'
			});
		}
		throw new Error('User is already banned.');
	}

	async muteUser(channelId: number, punishedId: number, punisherId: number) {
		const isMuted = await this.channelPunishmentService.isUserCurrentlyMuted(channelId, punishedId);

		if (!isMuted) {
			return this.channelPunishmentService.punishUser(
				channelId, punishedId, punisherId, 'mute', {
				reason: 'Un méchant garçon, à n\'en point douter.'
			});
		}
		throw new Error('User is already muted.');
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

	/**
	 * To display the user list of a group
	 */
	async getChannelUsers(id: string) {
		const channel = await this.channelsRepository.findOne(id, {
			relations: [
				'owner',
				'users',
				'admins',
				'punishments',
				'punishments.punishedUser',
			],
		});
		if (!channel) {
			throw new Error(`Channel [${id}] not found`);
		}

		const timeNow = new Date(Date.now());
		const activePunishements = channel.punishments.filter((punishment) => {
			return !punishment.endsAt || (punishment.endsAt > timeNow);
		});

		channel.punishments = activePunishements;
		return channel;
	}

	async nameIsAvailable(name: string) {
		const channel = await this.channelsRepository.findOne({
			where: {
				name
			}
		});
		return channel;
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
		const channel = await this.channelsRepository.findOne(id, {
			relations: [
				'owner',
				'users',
				'admins',
				'messages',
				'messages.author'
			]
		});
		if (!channel) {
			throw new Error(`Channel [${id}] not found`);
		}

		return channel;
	}

	async create(createChannelDto: CreateChannelDto) {
		const existingChannel = await this.nameIsAvailable(createChannelDto.name);
		const channel = this.channelsRepository.create(createChannelDto);

		if (existingChannel) {
			throw new Error(`Group '${createChannelDto.name}' already exists. Choose another name.`);
		}

		if (createChannelDto.password) {
			createChannelDto.password = await hashPassword(createChannelDto.password, 10);
		}

		this.logger.log(`Create new channel [${channel.name}]`);

		return await this.channelsRepository.save(channel).catch(() => {
			throw new Error(`Group '${createChannelDto.name}' already exists. Choose another name.`);
		});
	}

	async update(id: string, updateChannelDto: UpdateChannelDto) {
		if (updateChannelDto.name) {
			const existingChannel = await this.nameIsAvailable(updateChannelDto.name);
			if (existingChannel && existingChannel.id !== parseInt(id)) {
				throw new Error(`Group '${updateChannelDto.name}' already exists. Choose another name.`);
			}
		}

		if (updateChannelDto.password) {
			updateChannelDto.password = await hashPassword(updateChannelDto.password, 10);
		}

		const channel = await this.channelsRepository.preload({
			id: +id,
			...updateChannelDto
		});

		if (!channel) {
			throw new Error(`Cannot update Channel [${id}]: Not found`);
		}
		this.logger.log(`Update channel [${channel.id}][${channel.name}]`);

		return this.channelsRepository.save(channel);
	}

	async remove(id: string) { 
		const channel = await this.channelsRepository.findOne(id);

		if (!channel) {
			throw new Error(`Channel [${id}] not found`);
		}
		this.logger.log(`Remove channel [${channel.id}][${channel.name}]`);

		return this.channelsRepository.remove(channel);
	}
}
