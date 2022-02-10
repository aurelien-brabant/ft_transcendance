import { IsOptional } from "class-validator";
import { Users } from "src/users/entities/users.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Games {
    @PrimaryGeneratedColumn()
    id: number;

    @IsOptional()
    @ManyToMany(
        type => Users,
        user => user.games,
    )
    players: Users[];

/*    @IsOptional()
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

    @IsOptional()
    @OneToMany(
        type => Users,
        user => user.win
    )
    winner: Users;*/

    @IsOptional()
    @Column( {nullable: true} )
    winner: number;

    @Column({
        type: 'date',
        default: () => 'CURRENT_DATE',
    })
    createdAt: Date;
}