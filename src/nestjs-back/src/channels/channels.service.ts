import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channels } from './entities/channels.entity';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Injectable()
export class ChannelsService {
    constructor(
        @InjectRepository(Channels)
        private readonly channelsRepository: Repository<Channels>,
    ) {}

    findAll() {
        return this.channelsRepository.find();
    }

    async findOne(id: string) {
        const channel =  await this.channelsRepository.findOne(id);
        if (!channel)
            throw new NotFoundException(`Channel [${id}] not found`);
        return channel;
    }

    async findPeopleCount(id: string) {
        const channel = await this.channelsRepository.findOne(id);
        if (!channel)
            throw new NotFoundException(`Channel [${id}] not found`);
        return channel.peopleCount;
    }

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
        // check owner rights?
        if (!channel)
            throw new NotFoundException(`Channel [${id}] not found`);
        return this.channelsRepository.remove(channel);
    }
}
