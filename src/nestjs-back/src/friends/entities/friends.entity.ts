import { Users } from "src/users/entities/users.entity";
import { Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Friends {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToMany(
        type => Users,
        user => user.friends,
    )
    friends: Users[];
}