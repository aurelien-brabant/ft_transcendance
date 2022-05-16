import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import { User } from "src/users/entities/users.entity";
import { GameMode } from "../class/Constants";

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
    loserId: number;

    @Column({ nullable: true })
    winnerScore: number;

    @Column({ nullable: true })
    loserScore: number;

    @Column({
        type: "timestamptz",
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;

    @Column({
        type: "timestamptz",
        nullable: true,
        default: null
    })
    endedAt: Date;

    @Column({ nullable: true })
    gameDuration: number;

    @Column()
    mode: GameMode;
}