import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Users } from './entities/users.entity';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
    ) {}

    findAll() {
        return this.usersRepository.find();
    }

    async findOne(id: string) { 
            const user =  await this.usersRepository.findOne(id);
        if (!user)
            throw new NotFoundException(`User [${id}] not found`);
        return user;
    }

    create(createUserDto: CreateUserDto) {
        const user = this.usersRepository.create(createUserDto);
        return this.usersRepository.save(user);
    }
 
    async update(id: string, updateUserDto: UpdateUserDto) { 
        const user = await this.usersRepository.preload({
            id: +id,
            ...updateUserDto,
        });
        if (!user)
            throw new NotFoundException(`Cannot update user[${id}]: Not found`);
        return this.usersRepository.save(user);
    }
    
    async remove(id: string) { 
        const user = await this.findOne(id);
        return this.usersRepository.remove(user);
    }
}