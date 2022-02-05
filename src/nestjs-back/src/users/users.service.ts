import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { Friends } from 'src/friends/entities/friends.entity';
import { Games } from 'src/games/entities/games.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        @InjectRepository(Games)
        private readonly gamesRepository: Repository<Games>,
        @InjectRepository(Friends)
        private readonly friendsRepository: Repository<Friends>,
    ) {}

    findAll() {
        return this.usersRepository.find({
            relations: ['games', 'friends']
        });
    }

    async findOne(id: string) { 
        const user =  await this.usersRepository.findOne(id,
            {
                relations: ['games', 'friends']
            });
        if (!user)
            throw new NotFoundException(`User [${id}] not found`);
        return user;
    }

    async create(createUserDto: CreateUserDto) {
        const games = await Promise.all(
            createUserDto.games.map(id => this.preloadGameById(id)),
        );

        const friends = await Promise.all(
            createUserDto.friends.map(id => this.preloadGameById(id)),
        );

        const user = this.usersRepository.create({
            ...createUserDto,
            games,
            friends,
        });
        return this.usersRepository.save(user);
    }
 
    async update(id: string, updateUserDto: UpdateUserDto) { 
        const games = 
            updateUserDto.games &&
            (await Promise.all(
                updateUserDto.games.map(id => this.preloadGameById(id)),
            ));

        const friends =
            updateUserDto.friends &&
            (await Promise.all(
                updateUserDto.friends.map(id => this.preloadGameById(id)),
            ));

        const user = await this.usersRepository.preload({
            id: +id,
            ...updateUserDto,
            games,
            friends,
        });
        if (!user)
            throw new NotFoundException(`Cannot update user[${id}]: Not found`);
        return this.usersRepository.save(user);
    }
    
    async remove(id: string) { 
        const user = await this.findOne(id);
        return this.usersRepository.remove(user);
    }

    private async preloadGameById(id: number): Promise<Games> {
        const existingGame = await this.gamesRepository.findOne({id});
        if (existingGame)
            return existingGame;
        return this.gamesRepository.create({id});
    }

    private async preloadFriendById(id: number): Promise<Friends> {
        const existingFriend = await this.friendsRepository.findOne({id});
        if (existingFriend)
            return existingFriend;
        return this.friendsRepository.create({id});
    }
}