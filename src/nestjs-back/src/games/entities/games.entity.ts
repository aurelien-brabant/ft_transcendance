import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import { User } from "src/users/entities/users.entity";

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToMany(
        () => User,
        player => player.games
    )
    @JoinTable()
    players: User[];

    @Column({ nullable: true })
    winnerId: number;

    @Column({ nullable: true })
    looserId: number;

    @Column({
        default: () => Date.now()
    })
    createdAt: number;

    @Column({ nullable: true })
    endedAt: number;

    @Column({ nullable: true })
    gameDuration: number;

    @Column({ nullable: true })
    winnerScore: number;

    @Column({ nullable: true })
    looserScore: number;
}