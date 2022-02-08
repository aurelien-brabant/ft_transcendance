//import { IsOptional } from "class-validator";
//import { Users } from "src/users/entities/users.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Friends {
    @PrimaryGeneratedColumn()
    id: number;

 /*   @ManyToMany(
        type => Users,
        user => user.friends,
    )
    friends: Users[];*/
    friends: number[];
}