import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { arrayBuffer } from 'stream/consumers';
import { Users } from './entities/users.entity';

@Injectable()
export class UsersService {

    private users: Users[] = [
        {
            id: 1,
            username: "user1",
            email: "1@gmail.com",
            testArray: ['element1', 'element2'],
        },
        {
            id: 2,
            username: "user2",
            email: "2@gmail.com",
            testArray: ['element3', 'element4'],
        },
        {
            id: 3,
            username: "user3",
            email: "3@gmail.com",
            testArray: ['element5', 'element6'],
        },
        {
            id: 4,
            username: "user4",
            email: "4@gmail.com",
            testArray: ['element7', 'element8'],
        }
    ];

    findAll() { return this.users; }

    findOne(id: string) { 
        const user = this.users.find(item => item.id === +id);
        if (!user)
            throw new NotFoundException(`User [${id}] not found`);
        return user;
    }

    create(createUserDto: any) {
        this.users.push(createUserDto);
        return createUserDto;
    }
 
    update(id: string, updateUserDto: any) { 
        const existingUser = this.findOne(id);
        if (!existingUser)
            throw new NotFoundException(`Cannot remove user[${id}]: Not found`);
          return this.users.splice(1, parseInt(id) - 1, updateUserDto);
    }
    
    remove(id: string, updateUserDto: any) { 
        const existingUser = this.findOne(id);
        if (!existingUser)
            throw new NotFoundException(`Cannot update user [${id}]: Not found`);
        return this.users.filter(el => el !== existingUser);
    }
}