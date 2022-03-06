import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import { IsOptional } from "class-validator";
import { Users } from "src/users/entities/users.entity";

@Entity()
export class Games {
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
        () => Users,
        player => player.games
    )
    @JoinTable()
    players: Users[];

    @IsOptional()
    @ManyToOne(() => Users, user => user.wins, {
        onDelete: "CASCADE"
    })
    winner: Users;

    @Column({
        type: 'date',
        default: () => 'CURRENT_DATE',
    })
    createdAt: Date;
}