import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {

    private user: User[] = [
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
            email: "2@gmail.com",
            testArray: ['element7', 'element8'],
        }
    ];

    findAll() { return this.user; }

    findOne(id: string) { 
//        throw 'random error';
        const user = this.user.find(item => item.id === +id);
        if (!user)
            throw new NotFoundException(`${id} not found`);
//            throw new HttpException(`${id} not found`, HttpStatus.NOT_FOUND);
        return user;
    }

    create(createUserDto: any) {
        this.user.push(createUserDto);
        return createUserDto;
    }
 
    update(id: string, updateUserDto: any) { 
        const existingUser = this.findOne(id);
        if (existingUser)
//            return existingCoffee;
            return this.user.push(updateUserDto);
        }
    /*
    remove(id: string) { 
        const coffeeIndex = this.findIndex(item => item.id === +id);
            if (coffeeIndex)
                this.coffee.splice(coffeeIndex, 1);
    //            return existingCoffee;
            }*/
}