import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { Friends } from './entities/friends.entity';

@Injectable()
export class FriendsService {

    constructor(
        @InjectRepository(Friends)
        private readonly friendsRepository: Repository<Friends>,
    ) {}

    findAll() {
        return this.friendsRepository.find();
    }

    async findOne(id: string) { 
            const friendship =  await this.friendsRepository.findOne(id);
        if (!friendship)
            throw new NotFoundException(`Friendship [${id}] not found`);
        return friendship;
    }

    create(createFriendDto: CreateFriendDto) {
        const friendship = this.friendsRepository.create(createFriendDto);
        return this.friendsRepository.save(friendship);
    }
 
    async update(id: string, updateFriendDto: UpdateFriendDto) { 
        const friendship = await this.friendsRepository.preload({
            id: +id,
            ...updateFriendDto,
        });
        if (!friendship)
            throw new NotFoundException(`Cannot update friendship[${id}]: Not found`);
        return this.friendsRepository.save(friendship);
    }
   
    async remove(id: string) { 
        const friendship = await this.findOne(id);
        return this.friendsRepository.remove(friendship);
    }
}