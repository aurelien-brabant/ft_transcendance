import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import { IsOptional } from "class-validator";
import { User } from "src/users/entities/users.entity";

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    id: number;

    /*
    @IsOptional()
    @ManyToMany(
        type => Users,
        user => user.gamesInviteSender
    )
    gameInviteSender: Users;

    @IsOptional()
    @ManyToMany(
        type => Users,
        user => user.gamesInviteReceiver
    )
    gameInviteReceiver: Users;
    */

    @ManyToMany(
        () => User,
        player => player.games
    )
    @JoinTable()
    players: User[];

    @IsOptional()
    @ManyToOne(() => User, user => user.wins, {
        onDelete: "CASCADE"
    })
    winner: User;

    @Column({
        type: 'date',
        default: () => 'CURRENT_DATE',
    })
    createdAt: Date;
}