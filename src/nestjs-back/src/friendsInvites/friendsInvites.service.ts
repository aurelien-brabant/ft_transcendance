import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFriendInviteDto } from './dto/create-friendInvite.dto';
import { UpdateFriendInviteDto } from './dto/update-friendInvite.dto';
import { FriendsInvites } from './entities/friendsInvites.entity';

@Injectable()
export class FriendsInvitesService {

    constructor(
        @InjectRepository(FriendsInvites)
        private readonly friendsInvitesRepository: Repository<FriendsInvites>,
    ) {}

    findAll() {
        return this.friendsInvitesRepository.find();
    }

    async findOne(id: string) { 
            const invite =  await this.friendsInvitesRepository.findOne(id);
        if (!invite)
            throw new NotFoundException(`Friend invite [${id}] not found`);
        return invite;
    }

    create(createFriendInviteDto: CreateFriendInviteDto) {
        const invite = this.friendsInvitesRepository.create(createFriendInviteDto);
        return this.friendsInvitesRepository.save(invite);
    }
 
    async update(id: string, updateFriendInviteDto: UpdateFriendInviteDto) { 
        const invite = await this.friendsInvitesRepository.preload({
            id: +id,
            ...updateFriendInviteDto,
        });
        if (!invite)
            throw new NotFoundException(`Cannot update friend invite[${id}]: Not found`);
        return this.friendsInvitesRepository.save(invite);
    }
   
    async remove(id: string) { 
        const invite = await this.findOne(id);
        return this.friendsInvitesRepository.remove(invite);
    }
}