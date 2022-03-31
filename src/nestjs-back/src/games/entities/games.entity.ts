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
    loserId: number;

    @Column({ nullable: true })
    winnerScore: number;

    @Column({ nullable: true })
    loserScore: number;

    @Column({
        type: "date",
        default: () => "CURRENT_TIMESTAMP"
    })
    createdAt: number;

    @Column({
        type: "date",
    })
    @Column({ nullable: true })
    endedAt: number;

    @Column({ nullable: true })
    gameDuration: number;
}