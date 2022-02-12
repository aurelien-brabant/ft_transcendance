import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { SeedChannelDto } from './dto/seed-channel.dto';
import { Channels } from './entities/channels.entity';

@Injectable()
export class ChannelsService {

    // constructor(
    // ) {}

    // findAll

    // async findOne

    // create

    // async update

    // async remove
}
