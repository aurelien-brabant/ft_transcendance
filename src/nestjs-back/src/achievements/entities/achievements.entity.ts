import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import { User } from "src/users/entities/users.entity";

@Entity()
export class Achievement {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;

    @Column()
    description: string;

    @Column()
    levelToReach: number;

    @ManyToMany(
        () => User,
        users => users.achievements
    )
    @JoinTable()
    users: User[];
}