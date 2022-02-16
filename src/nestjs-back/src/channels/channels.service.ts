import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channels } from './entities/channels.entity';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { count } from 'console';
import { Users } from 'src/users/entities/users.entity';

@Injectable()
export class ChannelsService {
    constructor(
        @InjectRepository(Channels)
        private readonly channelsRepository: Repository<Channels>,
    ) {}

    findAll() {
        return this.channelsRepository.find();
    }

    async findAllByOwner(ownerId: string) {
        const channels = await this.channelsRepository
            .createQueryBuilder("channel")
            .where("channel.owner.id = :id", {id: ownerId})
            .getMany();
        return channels;
    }

    async findAllByPublic(isPublic: boolean) {
        return this.channelsRepository.find({
            isPublic: isPublic
        });
    }

    async findAllByProtected(isProtected: boolean) {
        return this.channelsRepository.find({
            isProtected: isProtected
        });
    }

    async findOne(id: string) {
        const channel =  await this.channelsRepository.findOne(id);
        if (!channel)
            throw new NotFoundException(`Channel [${id}] not found`);
        return channel;
    }

    async findUsers(id: string) {
        const channel = await this.channelsRepository.findOne(id);
        if (!channel)
            throw new NotFoundException(`Channel [${id}] not found`);
        return channel.users;
    }

    // async countPeople(id: string) {
    //     const channel = await this.channelsRepository.findOne(id);
    //     if (!channel)
    //         throw new NotFoundException(`Channel [${id}] not found`);
    //     TODO
    // }

    create(createChannelDto: CreateChannelDto) {
        const channel = this.channelsRepository.create(createChannelDto);
        return this.channelsRepository.save(channel);
    }

    async update(id: string, updateChannelDto: UpdateChannelDto) { 
        const channel = await this.channelsRepository.preload({
            id: +id,
            ...updateChannelDto,
        });
        if (!channel)
            throw new NotFoundException(`Cannot update Channel [${id}]: Not found`);
        return this.channelsRepository.save(channel);
    }

    async remove(id: string) { 
        const channel = await this.findOne(id);
        if (!channel)
            throw new NotFoundException(`Channel [${id}] not found`);
        return this.channelsRepository.remove(channel);
    }
}
