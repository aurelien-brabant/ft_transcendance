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
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: string;

    @Column({ nullable: true })
    endedAt: string;

    @Column({ nullable: true })
    winnerScore: number;

    @Column({ nullable: true })
    looserScore: number;
}