import { Friends } from "src/friends/entities/friends.entity";
import { Games } from "src/games/entities/games.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    pic: string;

    @Column()
    is_duoquadra: boolean;

    @Column({ nullable: true })
    rank: number;

    @JoinTable()
    @ManyToMany(
        type => Games,
        (games) => games.users,
        {
            cascade: true,
        }
    )
    games: Games[];

    @JoinTable()
    @ManyToMany(
        type => Friends,
        (friends) => friends.users,
        {
            cascade: true,
        }
    )
    friends: Friends[];
}